export const runtime = "edge";

import {
  S3Client,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

function makeS3() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(req: NextRequest) {
  const { key, uploadId, parts } = await req.json();
  // parts: Array<{ partNumber: number; etag: string }>

  if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const s3 = makeS3();
  const bucket = process.env.R2_BUCKET_NAME!;

  // Build the XML body manually — avoids DOMParser (not available in Workers)
  const xmlBody = [
    "<CompleteMultipartUpload>",
    ...parts.map(
      (p: { partNumber: number; etag: string }) =>
        `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${p.etag}</ETag></Part>`
    ),
    "</CompleteMultipartUpload>",
  ].join("");

  try {
    // Presign then execute via fetch — same reason as upload-start (no DOMParser)
    const completeUrl = await getSignedUrl(
      s3,
      new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }),
      { expiresIn: 60 }
    );
    const completeRes = await fetch(completeUrl, {
      method: "POST",
      body: xmlBody,
      headers: { "Content-Type": "application/xml" },
    });
    if (!completeRes.ok) {
      const text = await completeRes.text();
      throw new Error(`R2 complete failed (${completeRes.status}): ${text}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Best-effort abort to clean up the incomplete upload
    try {
      const abortUrl = await getSignedUrl(
        s3,
        new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }),
        { expiresIn: 60 }
      );
      await fetch(abortUrl, { method: "DELETE" });
    } catch {
      // ignore abort errors
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
