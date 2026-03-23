export const runtime = "edge";

import {
  S3Client,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
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

  try {
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(({ partNumber, etag }) => ({
            PartNumber: partNumber,
            ETag: etag,
          })),
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch {
    // Clean up the incomplete upload
    await s3
      .send(
        new AbortMultipartUploadCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          UploadId: uploadId,
        })
      )
      .catch(() => {});

    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
