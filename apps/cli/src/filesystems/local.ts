import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import * as os from 'node:os';
import * as tar from 'tar';
import { TLocalFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { FileSystem } from '~/filesystems/filesystem.ts';
import { logger } from '~/services/logger.ts';
import { randomString } from "~/utils/random.ts";
import { Readable, Writable } from 'node:stream';

export class LocalFileSystem extends FileSystem<TLocalFileSystemProviderOptions> {
  public name = 'local';

  public async connect() {
    logger.debug('Local filesystem connected');
  }

  public async disconnect() {
    logger.debug('Local filesystem disconnected');
  }

  public async write(filePath: string, content: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeSync(
      fs.openSync(filePath, 'w'),
      content
    );
  }

  public async writeStream(stream: Readable, path: string) {
    const ws = fs.createWriteStream(path);
    stream.pipe(ws);

    await new Promise((resolve, reject) => {
      ws.on('finish', () => resolve(undefined));
      ws.on('error', (err) => reject(err));
    });
  }

  public async read(path: string): Promise<string> {
    return fs.readFileSync(path, 'utf-8');
  }

  public async readStream(path: string): Promise<Readable> {
    return fs.createReadStream(path);
  }

  public async exists(path: string): Promise<boolean> {
    try {
      fs.accessSync(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async delete(path: string) {
    fs.unlinkSync(path);
  }

  public async list(directory: string): Promise<string[]> {
    return fs.readdirSync(directory);
  }

  public async mkdir(directory: string) {
    fs.mkdirSync(directory, { recursive: true });
  }

  public async copy(source: string, destination: string) {
    fs.copyFileSync(
      source,
      destination
    );
  }

  public async move(source: string, destination: string) {
    fs.renameSync(
      source,
      destination
    );
  }

  public async size(path: string): Promise<number> {
    return fs.statSync(path).size;
  }

  public async hash(path: string): Promise<string> {
    const fileBuffer = fs.readFileSync(path);
    return createHash("sha256").update(fileBuffer).digest("hex");
  }

  public async backup(source: string, destination: string): Promise<string> {
    const path = `${destination}/${randomString()}.tar.gz`;
    await this.mkdir(destination);

    await tar.c(
      {
        gzip: true,
        file: path,
        cwd: source,
      },
      fs.readdirSync(source),
    );

    return path;
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
