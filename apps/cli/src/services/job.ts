import { TJobConfig } from '@zero-backup/shared-types/config.ts';
import { logger } from "~/services/logger.ts";

export class Job {
  public constructor(public job: TJobConfig) {
    // ...
  }

  public doesItNeedToBeRun(): boolean {
    return true; // @todo
  }

  public async handle() {
    if (this.doesItNeedToBeRun()) {
      logger.info(`Handling job [${this.job.name}]...`);
      // @todo handle backup job
      logger.info('Job finished.');
      return;
    }

    logger.warn(`Skipped job [${this.job.name}]`);
  }
}
