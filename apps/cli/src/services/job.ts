import { TJobConfig } from '@zero-backup/shared-types/config.ts';
import { logger } from "~/services/logger.ts";
import { createFileSystem } from "~/filesystems/index.ts";
import { getFormattedDate } from '~/utils/date.ts';
import { randomString } from '~/utils/random.ts';

export class Job {
  public constructor(public job: TJobConfig) {
    // ...
  }

  public doesItNeedToBeRun(): boolean {
    return true; // @todo
  }

  private makeBackupFileName(path: string): string {
    return path
      .replace('{extension}', 'tar.gz')
      .replace('{date}', getFormattedDate('YYYY-MM-DD_HH-mm'))
      .replace('{timestamp}', new Date().getTime().toString())
      .replace('{random}', randomString(8))
      .replace('{uuid}', Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    ;
  }

  public async handle() {
    if (this.doesItNeedToBeRun()) {
      logger.info(`Handling job [${this.job.name}]...`);
      const { backup, storage } = this.job;
      const storagePath = this.makeBackupFileName(storage.path);

      const backupFs = createFileSystem(backup.adapter);
      await backupFs.connect();
      const storageFs = createFileSystem(storage.adapter);
      await storageFs.connect();

      const file = await backupFs.backup(backup.path, await backupFs.tempDirectory());
      await backupFs.transfer(storageFs, file, storagePath);


      const hash = await backupFs.hash(file);

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
