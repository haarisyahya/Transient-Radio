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

    // Initiate the multipart upload
    const { UploadId } = await s3.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
      })
    );

    // Pre-sign a URL for every part (1 hour expiry to allow slow uploads)
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
    const partUrls = await Promise.all(
      Array.from({ length: totalParts }, (_, i) =>
        getSignedUrl(
          s3,
          new UploadPartCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            UploadId,
            PartNumber: i + 1,
          }),
          { expiresIn: 3600 }
        )
      )
    );

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      uploadId: UploadId,
      key,
      partUrls,
      publicUrl,
      chunkSize: CHUNK_SIZE,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
