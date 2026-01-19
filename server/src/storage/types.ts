/**
 * Storage Adapter Interface
 * All storage backends must implement this interface
 */
export interface ImageMeta {
  id: string
  name: string
  url: string
  size: string
  date: string
  dimensions: string
  tags: string[]
}

export interface StorageAdapter {
  /** Save a file and return its public URL */
  save(file: Buffer, filename: string, mimetype: string): Promise<string>
  
  /** Delete a file by its ID/filename */
  delete(id: string): Promise<boolean>
  
  /** Get file URL by ID */
  getUrl(id: string): string
  
  /** List all files (for metadata, we store separately) */
  exists(id: string): Promise<boolean>
}

export interface StorageConfig {
  type: 'local' | 's3' | 'minio'
  local?: {
    uploadDir: string
    publicUrl: string
  }
  s3?: {
    endpoint: string
    region: string
    bucket: string
    accessKey: string
    secretKey: string
    publicUrl?: string
  }
}
