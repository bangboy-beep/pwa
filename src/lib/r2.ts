// Cloudflare R2 Storage Service
// S3-compatible object storage — zero egress fees
// Replaces Supabase Storage for images & videos

import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || ''
const ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || ''
const BUCKET = import.meta.env.VITE_R2_BUCKET || 'smartqr-media'
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`

// Cross-region endpoint for R2
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`

function getClient() {
  return new S3Client({
    region: 'auto',
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  })
}

export interface UploadResult {
  url: string
  error: string | null
}

export async function uploadR2(
  fileName: string,
  file: File
): Promise<UploadResult> {
  const client = getClient()

  try {
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: file,
      ContentType: file.type,
    }))

    return { url: `${PUBLIC_URL}/${encodeURIComponent(fileName)}`, error: null }
  } catch (err: any) {
    return { url: '', error: err.message || 'Upload failed' }
  }
}

export async function deleteR2(keys: string[]): Promise<{ error: string | null }> {
  const client = getClient()
  try {
    await client.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map(k => ({ Key: k })) },
    }))
    return { error: null }
  } catch (err: any) {
    return { error: err.message || 'Delete failed' }
  }
}

export function getPublicUrl(fileName: string): string {
  return `${PUBLIC_URL}/${encodeURIComponent(fileName)}`
}

export function isConfigured(): boolean {
  return !!(ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET)
}
