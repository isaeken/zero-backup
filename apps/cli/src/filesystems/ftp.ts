import { createHash } from 'node:crypto';
import * as ftp from 'basic-ftp';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { TFTPFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { logger } from '~/services/logger.ts';
import { randomString } from '~/utils/random.ts';
import fs from 'node:fs';
import path from 'node:path';
import * as os from 'os';
import { PassThrough, Readable, Writable } from 'node:stream';

export class FTPFilesystem extends FileSystem<TFTPFileSystemProviderOptions> {
  public name = 'ftp';

  private client: ftp.Client | undefined;

  public constructor(config: TFTPFileSystemProviderOptions) {
    super(config);
  }

  private async createTempFile(): Promise<string> {
    logger.debug('[FTPFilesystem] Creating temporary file');

    const tempFile = fs.mkdtempSync(path.join(os.tmpdir(), 'zero-backup-'));
    return `${tempFile}/tempfile`;
  }

  public async connect(): Promise<void> {
    logger.debug('[FTPFilesystem] Connecting to FTP server');

    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
    await this.client.access({
      host: this.config.host,
      port: this.config.port || 21,
      user: this.config.username,
      password: this.config.password,
      secure: this.config.secure || false
    });
  }

  public async disconnect(): Promise<void> {
    logger.debug('[FTPFilesystem] Disconnecting from FTP server');

    await this.client?.close();
  }

  public async write(filePath: string, content: string): Promise<void> {
    logger.debug(`[FTPFilesystem] Writing file: ${filePath}`);

    const tempFile = await this.createTempFile();
    fs.writeFileSync(tempFile, content);
    await this.client?.uploadFrom(tempFile, filePath);
    fs.unlinkSync(tempFile);
  }

  public async writeStream(stream: Readable, path: string) {
    logger.debug(`[FTPFilesystem] Writing stream for path: ${path}`);
    if (!this.client) {
      throw new Error('FTP client not connected');
    }

    const ws = await this.client.uploadFrom(stream, path);
    await new Promise((resolve, reject) => {
      if (ws.code === 226) {
        resolve(undefined);
      } else {
        reject(new Error(`FTP upload failed with code ${ws.code}`));
      }
    });
  }

  public async read(filePath: string): Promise<string> {
    logger.debug(`[FTPFilesystem] Reading file: ${filePath}`);

    const tempFile = await this.createTempFile();
    await this.client?.downloadTo(tempFile, filePath);
    const content = fs.readFileSync(tempFile, 'utf-8');
    fs.unlinkSync(tempFile);
    return content;
  }

  public async readStream(path: string): Promise<Readable> {
    logger.debug(`[FTPFilesystem] Reading stream for path: ${path}`);

    const passThrough = new PassThrough();

    this.client?.downloadTo(passThrough, path).catch(err => {
      passThrough.destroy(err);
    });

    return passThrough;
  }

  public async exists(filePath: string): Promise<boolean> {
    logger.debug(`[FTPFilesystem] Checking if file exists: ${filePath}`);

    try {
      await this.client?.size(filePath);
      return true;
    } catch (error: any) {
      if (error.code === 550) return false; // File not found
      throw error;
    }
  }

  public async delete(filePath: string): Promise<void> {
    logger.debug(`[FTPFilesystem] Deleting file: ${filePath}`);

    await this.client?.remove(filePath);
  }

  public async list(directory: string): Promise<string[]> {
    logger.debug(`[FTPFilesystem] Listing files in directory: ${directory}`);

    const fileList = await this.client?.list(directory);
    return fileList?.map(file => file.name) ?? [];
  }

  public async mkdir(directory: string): Promise<void> {
    logger.debug(`[FTPFilesystem] Creating directory: ${directory}`);

    await this.client?.ensureDir(directory);
  }

  public async copy(source: string, destination: string): Promise<void> {
    logger.debug(`[FTPFilesystem] Copying file: ${source} to ${destination}`);

    const content = await this.read(source);
    await this.write(destination, content);
  }

  public async move(source: string, destination: string): Promise<void> {
    logger.debug(`[FTPFilesystem] Moving file: ${source} to ${destination}`);

    await this.client?.rename(source, destination);
  }

  public async size(filePath: string): Promise<number> {
    logger.debug(`[FTPFilesystem] Getting size of file: ${filePath}`);

    return await this.client?.size(filePath) ?? 0;
  }

  public async hash(path: string): Promise<string> {
    logger.debug(`[FTPFilesystem] Getting hash of file: ${path}`);

    const tempFile = await this.createTempFile();
    await this.client?.downloadTo(tempFile, path);
    const fileBuffer = fs.readFileSync(tempFile);
    const hash = createHash("sha256").update(fileBuffer).digest("hex");
    fs.unlinkSync(tempFile);
    return hash;
  }

  public async backup(source: string, destination: string): Promise<string> {
    logger.debug(`[FTPFilesystem] Backing up file: ${source} to ${destination}`);

    throw new Error('Backup in [FTP] not supported.');
  }

  public async tempDirectory(): Promise<string> {
    logger.debug('[FTPFilesystem] Creating temporary directory');

    const name = `/tmp/zero-backup/${randomString()}`;
    await this.mkdir(name);
    return name;
  }

  public get free(): Promise<number> {
    logger.debug('[FTPFilesystem] Getting free space');

    return Promise.resolve(0);
  }

  public get used(): Promise<number> {
    logger.debug('[FTPFilesystem] Getting used space');

    return Promise.resolve(0);
  }

  public get total(): Promise<number> {
    logger.debug('[FTPFilesystem] Getting total space');

    return Promise.resolve(0);
  }
}
