import { TJobConfig } from '@zero-backup/shared-types/src';
import { logger } from '~/index';
import { createSource } from '~/sources';
import { createProvider } from '~/providers';

export class Job {
  public constructor(public job: TJobConfig) {
    // ...
  }

  public doesItNeedToBeRun(): boolean {
    return true; // @todo
  }

  public generate(): void {
    const source = createSource(this.job.source);

    logger.debug(`Generating backup using [${source.name}]...`);
    const path = source.handle();
    logger.debug('Backup generation done.');

    const provider = createProvider(this.job.provider);
    logger.debug(`Uploading file from [${source.name}:${path}] using [${provider.name}]...`);
    provider.handle(source, path);
    logger.debug(`Upload done [${source.name}:${path}]`);
  }

  public handle() {
    if (this.doesItNeedToBeRun()) {
      logger.info(`Handling job [${this.job.name}]...`);
      this.generate();
      logger.info('Job finished.');
      return;
    }

    logger.warn(`Skipped job [${this.job.name}]`);
  }
}
