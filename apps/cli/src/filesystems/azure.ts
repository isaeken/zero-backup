import { Buffer } from 'node:buffer';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { TAzureFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { logger } from '~/services/logger.ts';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { createHash } from 'node:crypto';

export class AzureFilesystem extends FileSystem<TAzureFileSystemProviderOptions> {
  public name = 'azure';

  private client: BlobServiceClient;

  private containerClient: ContainerClient;

  public constructor(config: TAzureFileSystemProviderOptions) {
    super(config);

    this.client = BlobServiceClient.fromConnectionString(this.config.connectionString);
    this.containerClient = this.client.getContainerClient(this.config.containerName);
  }

  public async connect(): Promise<void> {
    logger.debug(`[AzureFilesystem] Connected to Azure Blob Storage`);
    await this.containerClient.createIfNotExists();
  }

  public async disconnect(): Promise<void> {
    logger.debug(`[AzureFilesystem] Disconnected from Azure Blob Storage`);
  }

  public async write(filePath: string, content: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.upload(content, Buffer.byteLength(content));
  }

  public async read(filePath: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    const downloadResponse = await blockBlobClient.download();
    const downloaded = await downloadResponse.blobBody;
    if (downloaded === undefined) {
      throw new Error('Downloaded blob is undefined');
    }

    return await downloaded.text();
  }

  public async exists(filePath: string): Promise<boolean> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    return await blockBlobClient.exists();
  }

  public async delete(filePath: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.delete();
  }

  public async list(directory: string = ""): Promise<string[]> {
    let fileList: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat({ prefix: directory })) {
      fileList.push(blob.name);
    }
    return fileList;
  }

  public async mkdir(directory: string): Promise<void> {
    logger.debug(`[AzureFilesystem] Azure Blob Storage doesn't require mkdir`);
  }

  public async copy(source: string, destination: string): Promise<void> {
    const sourceBlob = this.containerClient.getBlockBlobClient(source);
    const destBlob = this.containerClient.getBlockBlobClient(destination);
    await destBlob.beginCopyFromURL(sourceBlob.url);
  }

  public async move(source: string, destination: string): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source);
  }

  public async size(filePath: string): Promise<number> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    const properties = await blockBlobClient.getProperties();
    return properties.contentLength || 0;
  }

  public async hash(path: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(path);
    const downloadResponse = await blockBlobClient.download();
    if (! downloadResponse.blobBody) {
      throw new Error('Downloaded blob is undefined');
    }
    const buffer = Buffer.from(await (await downloadResponse.blobBody).arrayBuffer());
    return createHash('sha256').update(buffer).digest('hex');
  }

  public async backup(source: string, destination: string): Promise<void> {
    throw new Error('Backup in [Azure] not supported.');
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
