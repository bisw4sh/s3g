import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.BUCKET_URL}:${process.env.BUCKET_PORT}`,
  credentials: {
    accessKeyId: process.env.BUCKET_KEY!,
    secretAccessKey: process.env.BUCKET_SECRET!,
  },
  forcePathStyle: true,
});

export async function getPresignedUrl(fileName: string, fileType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  return await getSignedUrl(s3, command, { expiresIn: 5 * 60 });
}

