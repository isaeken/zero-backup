import { Bucket, Storage } from '@google-cloud/storage';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { TGoogleCloudFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { logger } from '~/services/logger.ts';
import { createHash } from 'node:crypto';

export class GoogleCloudFilesystem extends FileSystem<TGoogleCloudFileSystemProviderOptions> {
  public name = 'gcs';

  private storage: Storage;

  private bucket: Bucket;

  public constructor(config: TGoogleCloudFileSystemProviderOptions) {
    super(config);
    this.storage = new Storage({
      projectId: this.config.projectId,
      keyFilename: this.config.keyFilename
    });
    this.bucket = this.storage.bucket(this.config.bucketName);
  }

  public async connect(): Promise<void> {
    logger.debug(`[GoogleCloudFilesystem] Connected to Google Cloud Storage`);

    await this.bucket.exists().then(([exists]) => {
      if (!exists) {
        throw new Error(`Bucket ${this.config.bucketName} does not exist.`);
      }
    });
  }

  public async disconnect(): Promise<void> {
    logger.debug(`[GoogleCloudFilesystem] Disconnected from Google Cloud Storage`);
  }

  public async write(filePath: string, content: string): Promise<void> {
    const file = this.bucket.file(filePath);
    await file.save(content);
  }

  public async read(filePath: string): Promise<string> {
    const file = this.bucket.file(filePath);
    const [contents] = await file.download();
    return contents.toString();
  }

  public async exists(filePath: string): Promise<boolean> {
    const file = this.bucket.file(filePath);
    const [exists] = await file.exists();
    return exists;
  }

  public async delete(filePath: string): Promise<void> {
    const file = this.bucket.file(filePath);
    await file.delete();
  }

  public async list(directory: string = ""): Promise<string[]> {
    const [files] = await this.bucket.getFiles({ prefix: directory });
    return files.map(file => file.name);
  }

  public async mkdir(directory: string): Promise<void> {
    logger.debug(`[GoogleCloudFilesystem] Google Cloud Storage doesn't require mkdir`);
  }

  public async copy(source: string, destination: string): Promise<void> {
    const sourceFile = this.bucket.file(source);
    await sourceFile.copy(this.bucket.file(destination));
  }

  public async move(source: string, destination: string): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source);
  }

  public async size(filePath: string): Promise<number> {
    const file = this.bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    return metadata.size ? parseInt(metadata.size as string, 10) : 0;
  }

  public async hash(path: string): Promise<string> {
    const file = this.bucket.file(path);
    const [buffer] = await file.download();
    return createHash("sha256").update(buffer).digest("hex");
  }

  public async backup(source: string, destination: string): Promise<void> {
    throw new Error('Backup in [GCS] not supported.');
  }

  public get free(): Promise<number> {
    return Promise.resolve(0);
  }

  public get used(): Promise<number> {
    return Promise.resolve(0);
  }

  public get total(): Promise<number> {
    return Promise.resolve(0);
  }
}
