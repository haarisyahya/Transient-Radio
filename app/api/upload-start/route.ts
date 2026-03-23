export const runtime = "edge";

import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB per part

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
  const { fileName, contentType, folder, fileSize } = await req.json();

  if (!fileName || !contentType || !folder || !fileSize) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const s3 = makeS3();
    const timestamp = Date.now();
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const key = `${folder}/${timestamp}-${sanitized}`;
    const bucket = process.env.R2_BUCKET_NAME!;

    // Presign the CreateMultipartUpload request then call R2 via fetch.
    // We cannot use s3.send() on Cloudflare Workers — it uses DOMParser to
    // deserialise the XML response, which Workers does not provide.
    const initiateUrl = await getSignedUrl(
      s3,
      new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 60 }
    );
    const initiateRes = await fetch(initiateUrl, {
      method: "POST",
      headers: { "Content-Type": contentType },
    });
    if (!initiateRes.ok) {
      const text = await initiateRes.text();
      throw new Error(`R2 initiate failed (${initiateRes.status}): ${text}`);
    }
    const xml = await initiateRes.text();
    const uploadId = xml.match(/<UploadId>(.+?)<\/UploadId>/)?.[1];
    if (!uploadId) throw new Error("Could not parse UploadId from R2 response");

    // Pre-sign a URL for every part (getSignedUrl is local-only, no network call)
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
    const partUrls = await Promise.all(
      Array.from({ length: totalParts }, (_, i) =>
        getSignedUrl(
          s3,
          new UploadPartCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: i + 1,
          }),
          { expiresIn: 3600 }
        )
      )
    );

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadId, key, partUrls, publicUrl, chunkSize: CHUNK_SIZE });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
