import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import type { StorageAdapter } from './types.js'

/**
 * S3/MinIO Storage Adapter
 * Works with AWS S3, Cloudflare R2, MinIO, and any S3-compatible service
 */
export class S3Storage implements StorageAdapter {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor(config: {
    endpoint: string
    region: string
    bucket: string
    accessKey: string
    secretKey: string
    publicUrl?: string
  }) {
    this.bucket = config.bucket
    this.publicUrl = config.publicUrl || `${config.endpoint}/${config.bucket}`
    
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    })
  }

  async save(file: Buffer, filename: string, mimetype: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file,
      ContentType: mimetype,
      ACL: 'public-read', // Make files publicly accessible
    })

    await this.client.send(command)
    return this.getUrl(filename)
  }

  async delete(id: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: id,
      })
      await this.client.send(command)
      return true
    } catch {
      return false
    }
  }

  getUrl(id: string): string {
    return `${this.publicUrl}/${id}`
  }

  async exists(id: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: id,
      })
      await this.client.send(command)
      return true
    } catch {
      return false
    }
  }
}
