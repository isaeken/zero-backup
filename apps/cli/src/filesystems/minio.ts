import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { Client } from "minio";
import { TMinioFileSystemProviderOptions } from "@zero-backup/shared-types/fileystem.ts";
import { FileSystem } from "~/filesystems/filesystem.ts";
import { logger } from "~/services/logger.ts";

export class MinioFilesystem extends FileSystem<TMinioFileSystemProviderOptions> {
  public name = 'minio';

  private client: Client;

  public constructor(config: TMinioFileSystemProviderOptions) {
    super(config);
    this.client = new Client({
      endPoint: this.config.endPoint,
      port: this.config.port,
      useSSL: this.config.useSSL || false,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
    });
  }

  public async connect(): Promise<void> {
    logger.debug(`[MinioFilesystem] Connected to MinIO server at ${this.config.endPoint}`);
    const exists = await this.client.bucketExists(this.config.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.config.bucketName);
      logger.debug(`[MinioFilesystem] Created bucket: ${this.config.bucketName}`);
    }
  }

  public async disconnect(): Promise<void> {
    logger.debug(`[MinioFilesystem] Disconnected from MinIO server`);
  }

  public async write(filePath: string, content: string): Promise<void> {
    await this.client.putObject(this.config.bucketName, filePath, content);
  }

  public async read(filePath: string): Promise<string> {
    const stream = await this.client.getObject(this.config.bucketName, filePath);
    return await this.streamToString(stream);
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      await this.client.statObject(this.config.bucketName, filePath);
      return true;
    } catch (error: any) {
      if (error.code === "NoSuchKey") {
        return false;
      }

      throw error;
    }
  }

  public async delete(filePath: string): Promise<void> {
    await this.client.removeObject(this.config.bucketName, filePath);
  }

  public async list(directory: string = ""): Promise<string[]> {
    const stream = this.client.listObjectsV2(this.config.bucketName, directory, true);
    const files: string[] = [];
    for await (const obj of stream) {
      files.push(obj.name);
    }
    return files;
  }

  public async mkdir(directory: string): Promise<void> {
    logger.debug(`[MinioFilesystem] MinIO doesn't require explicit mkdir`);
  }

  public async copy(source: string, destination: string): Promise<void> {
    await this.client.copyObject(this.config.bucketName, destination, `/${this.config.bucketName}/${source}`);
  }

  public async move(source: string, destination: string): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source);
  }

  public async size(filePath: string): Promise<number> {
    const stat = await this.client.statObject(this.config.bucketName, filePath);
    return stat.size;
  }

  public async hash(path: string): Promise<string> {
    const stream = await this.client.getObject(this.config.bucketName, path);
    const hash = createHash("sha256");

    return new Promise((resolve, reject) => {
      // deno-lint-ignore no-explicit-any
      stream.on("data", (chunk: any) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  public async backup(source: string, destination: string): Promise<void> {
    throw new Error('Backup in [Minio] not supported.');
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

  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      stream.on("error", reject);
    });
  }
}
