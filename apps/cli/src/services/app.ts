import { TConfig } from '@zero-backup/shared-types/config.ts';
import { Job } from '~/services/job.ts';
import { logger } from '~/index.ts';

export class App {
  public constructor(public config: TConfig) {
    // ...
  }

  public async handle() {
    for await (const job of this.config.jobs) {
      await new Job(job).handle();
    }
  }

  public run() {
    logger.debug('Starting...');

    this.handle();
  }
}
