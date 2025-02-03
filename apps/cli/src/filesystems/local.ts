import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as os from 'node:os';
import { TLocalFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { logger } from '~/services/logger.ts';
import { randomString } from "~/utils/random.ts";

export class LocalFileSystem extends FileSystem<TLocalFileSystemProviderOptions> {
  public name = 'local';

  // deno-lint-ignore require-await
  public async connect() {
    logger.debug('Local filesystem connected');
  }

  // deno-lint-ignore require-await
  public async disconnect() {
    logger.debug('Local filesystem disconnected');
  }

  // deno-lint-ignore require-await
  public async write(filePath: string, content: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeSync(
      fs.openSync(filePath, 'w'),
      content
    );
  }

  // deno-lint-ignore require-await
  public async read(path: string): Promise<string> {
    return fs.readFileSync(path, 'utf-8');
  }

  // deno-lint-ignore require-await
  public async exists(path: string): Promise<boolean> {
    try {
      fs.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  // deno-lint-ignore require-await
  public async delete(path: string) {
    fs.unlinkSync(path);
  }

  // deno-lint-ignore require-await
  public async list(directory: string): Promise<string[]> {
    return fs.readdirSync(directory);
  }

  // deno-lint-ignore require-await
  public async mkdir(directory: string) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // deno-lint-ignore require-await
  public async copy(source: string, destination: string) {
    fs.copyFileSync(
      source,
      destination
    );
  }

  // deno-lint-ignore require-await
  public async move(source: string, destination: string) {
    fs.renameSync(
      source,
      destination
    );
  }

  // deno-lint-ignore require-await
  public async size(path: string): Promise<number> {
    return fs.statSync(path).size;
  }

  // deno-lint-ignore require-await
  public async hash(path: string): Promise<string> {
    const fileBuffer = fs.readFileSync(path);
    return createHash("sha256").update(fileBuffer).digest("hex");
  }

  public async backup(source: string, destination: string): Promise<string> {
    throw new Error('Backup in [Local] not supported.');
  }

  public async tempDirectory(): Promise<string> {
    const name = `/tmp/zero-backup/${randomString()}`;
    await this.mkdir(name);
    return name;
  }

  public get free(): Promise<number> {
    return Promise.resolve(os.freemem());
  }

  public get used(): Promise<number> {
    return Promise.resolve(os.totalmem() - os.freemem());
  }

  public get total(): Promise<number> {
    return Promise.resolve(os.totalmem());
  }
}
