import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";

let cachedS3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.R2_PUBLIC_ENDPOINT?.trim();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("SERVER ERROR: R2 Credentials are still missing from process.env!");
  }

  const finalEndpoint = endpoint && endpoint.includes('r2.cloudflarestorage')
    ? endpoint
    : `https://${accountId}.r2.cloudflarestorage.com`;

  const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    keepAliveMsecs: 60000,
  });

  cachedS3Client = new S3Client({
    region: "auto",
    endpoint: finalEndpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
      httpsAgent: agent,
    }),
  });

  return cachedS3Client;
}

export async function uploadFileToR2(fileBuffer: Buffer | Uint8Array, fileName: string, mimeType: string) {
  const s3Client = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    ContentLength: fileBuffer.length,
  });

  return await s3Client.send(command);
}

export async function deleteFileFromR2(fileName: string) {
  const s3Client = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const command = new DeleteObjectCommand({
    Bucket: bucket!,
    Key: fileName,
  });

  return await s3Client.send(command);
}

export async function getSignedUrlForR2(fileName: string) {
  const s3Client = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const command = new GetObjectCommand({
    Bucket: bucket!,
    Key: fileName,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getSignedUrlForR2Download(
  objectKey: string,
  originalFilename: string,
  mimeType?: string
) {
  const s3Client = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();

  // RFC 6266 / RFC 5987 compliant Content-Disposition:
  // - filename="..."  : fallback for old browsers, must be ASCII-safe (encode spaces)
  // - filename*=UTF-8''...  : full RFC 5987 encoding for modern browsers
  const asciiFallback = originalFilename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  const rfc5987Encoded = encodeURIComponent(originalFilename)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");

  const disposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${rfc5987Encoded}`;

  const commandInput: GetObjectCommandInput = {
    Bucket: bucket!,
    Key: objectKey,
    ResponseContentDisposition: disposition,
    ...(mimeType ? { ResponseContentType: mimeType } : {}),
  };

  const command = new GetObjectCommand(commandInput);
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
