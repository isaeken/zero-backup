import { TConfig } from '@zero-backup/shared-types';
import { Job } from '~/services/job';
import { logger } from '~/index';

export class App {
  public constructor(public config: TConfig) {
    // ...
  }

  public handle() {
    for (const job of this.config.jobs) {
      new Job(job).handle();
    }
  }

  public run() {
    logger.debug('Starting...');

    this.handle();
  }
}
