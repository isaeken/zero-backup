import { TJobConfig } from '@zero-backup/shared-types/config.ts';
import { logger } from "~/services/logger.ts";
import { createFileSystem } from "~/filesystems/index.ts";

export class Job {
  public constructor(public job: TJobConfig) {
    // ...
  }

  public doesItNeedToBeRun(): boolean {
    return true; // @todo
  }

  private makeBackupFileName(path: string): string {
    return path
      .replace('{name}', `backup-${new Date().toISOString()}`)
      .replace('{date}', new Date().toISOString())
      .replace('{timestamp}', new Date().getTime().toString())
      .replace('{random}', Math.random().toString())
      .replace('{uuid}', Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    ;
  }

  public async handle() {
    if (this.doesItNeedToBeRun()) {
      logger.info(`Handling job [${this.job.name}]...`);
      const { backup, storage } = this.job;
      const storagePath = this.makeBackupFileName(storage.path);

      const backupFs = createFileSystem(backup.adapter);
      const storageFs = createFileSystem(storage.adapter);

      await backupFs.connect();
      const file = await backupFs.backup(backup.path, await backupFs.tempDirectory());
      const contents = await backupFs.read(file);
      const hash = await backupFs.hash(file);

      await storageFs.connect();
      await storageFs.write(storagePath, contents);
      if (await storageFs.hash(storagePath) !== hash) {
        throw new Error('Hash mismatch');
      }
      await backupFs.disconnect();
      await storageFs.disconnect();

      logger.info('Job finished.');
      return;
    }

    logger.warn(`Skipped job [${this.job.name}]`);
  }
}
