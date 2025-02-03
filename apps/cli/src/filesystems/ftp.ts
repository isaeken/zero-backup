import { createHash } from 'node:crypto';
import ftp from 'basic-ftp';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { TFTPFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { logger } from '~/services/logger.ts';
import { randomString } from '~/utils/random.ts';
import fs from 'node:fs';
import path from 'node:path';
import * as os from 'os';

export class FTPFilesystem extends FileSystem<TFTPFileSystemProviderOptions> {
  public name = 'ftp';

  private client: ftp.Client;

  public constructor(config: TFTPFileSystemProviderOptions) {
    super(config);
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
  }

  private async createTempFile(): Promise<string> {
    const tempFile = fs.mkdtempSync(path.join(os.tmpdir(), 'zero-backup-'));
    return `${tempFile}/tempfile`;
  }

  public async connect(): Promise<void> {
    logger.debug('[FTPFilesystem] Connecting to FTP server');

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

    await this.client.close();
  }

  public async write(filePath: string, content: string): Promise<void> {
    const tempFile = await this.createTempFile();
    fs.writeFileSync(tempFile, content);
    await this.client.uploadFrom(tempFile, filePath);
    fs.unlinkSync(tempFile);
  }

  public async read(filePath: string): Promise<string> {
    const tempFile = await this.createTempFile();
    await this.client.downloadTo(tempFile, filePath);
    const content = fs.readFileSync(tempFile, 'utf-8');
    fs.unlinkSync(tempFile);
    return content;
  }

  public async exists(filePath: string): Promise<boolean> {
    try {
      await this.client.size(filePath);
      return true;
    } catch (error: any) {
      if (error.code === 550) return false; // File not found
      throw error;
    }
  }

  public async delete(filePath: string): Promise<void> {
    await this.client.remove(filePath);
  }

  public async list(directory: string): Promise<string[]> {
    const fileList = await this.client.list(directory);
    return fileList.map(file => file.name);
  }

  public async mkdir(directory: string): Promise<void> {
    await this.client.ensureDir(directory);
  }

  public async copy(source: string, destination: string): Promise<void> {
    const content = await this.read(source);
    await this.write(destination, content);
  }

  public async move(source: string, destination: string): Promise<void> {
    await this.client.rename(source, destination);
  }

  public async size(filePath: string): Promise<number> {
    return await this.client.size(filePath);
  }

  public async hash(path: string): Promise<string> {
    const tempFile = await this.createTempFile();
    await this.client.downloadTo(tempFile, path);
    const fileBuffer = fs.readFileSync(tempFile);
    const hash = createHash("sha256").update(fileBuffer).digest("hex");
    fs.unlinkSync(tempFile);
    return hash;
  }

  public async backup(source: string, destination: string): Promise<string> {
    throw new Error('Backup in [FTP] not supported.');
  }

  public async tempDirectory(): Promise<string> {
    const name = `/tmp/zero-backup/${randomString()}`;
    await this.mkdir(name);
    return name;
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
