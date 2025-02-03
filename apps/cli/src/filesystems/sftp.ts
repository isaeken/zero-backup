import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { TSFTPFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { FileSystem } from "~/filesystems/filesystem.ts";
import { logger } from "~/services/logger.ts";
import { randomString } from "~/utils/random.ts";
import SftpClient from 'ssh2-sftp-client';

export class SftpFileSystem extends FileSystem<TSFTPFileSystemProviderOptions> {
  public name = 'sftp';

  public client: SftpClient;

  public constructor(config: TSFTPFileSystemProviderOptions) {
    super(config);
    this.client = new SftpClient();
  }

  public async connect() {
    logger.debug('[SFTPFilesystem] Connecting to SFTP server');

    await this.client.connect({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
    });
  }

  public async disconnect() {
    logger.debug('[SFTPFilesystem] Disconnecting from SFTP server');

    await this.client.end();
  }

  public async write(path: string, content: string): Promise<void> {
    await this.client.put(Buffer.from(content), path);
  }

  public async read(path: string): Promise<string> {
    const buffer = await this.client.get(path, undefined, {});
    return buffer.toString();
  }

  public async exists(path: string): Promise<boolean> {
    try {
      await this.client.stat(path);
      return true;
    // deno-lint-ignore no-explicit-any
    } catch (e: any) {
      if (e.code === 2) {
        return false;
      }

      throw e;
    }
  }

  public async delete(path: string) {
    await this.client.delete(path);
  }

  public async list(directory: string): Promise<string[]> {
    const list = await this.client.list(directory, () => true);
    return list.map((file) => file.name);
  }

  public async mkdir(directory: string): Promise<void> {
    await this.client.mkdir(directory, true);
  }

  public async copy(source: string, destination: string): Promise<void> {
    const content = await this.read(source);
    await this.write(destination, content);
  }

  public async move(source: string, destination: string): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source);
  }

  public async size(path: string): Promise<number> {
    // deno-lint-ignore no-explicit-any
    return ((await this.client.stat(path)) as any).size;
  }

  public async hash(path: string): Promise<string> {
    const tempFile = fs.mkdtempSync("/tmp/sftp-hash-");
    const tempFilePath = `${tempFile}/tempfile`;
    await this.client.fastGet(path, tempFilePath);
    const fileBuffer = fs.readFileSync(tempFilePath);
    const hash = createHash("sha256").update(fileBuffer).digest("hex");
    fs.unlinkSync(tempFilePath);
    fs.rmdirSync(tempFile);
    return hash;
  }

  public async backup(source: string, destination: string): Promise<string> {
    throw new Error('Backup in [SFTP] not supported.');
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
