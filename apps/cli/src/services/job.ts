import { logger } from '~/index.ts';
import { createSource } from '~/sources/index.ts';
import { createProvider } from '~/providers/index.ts';
import { TJobConfig } from '@zero-backup/shared-types/config.ts';

export class Job {
  public constructor(public job: TJobConfig) {
    // ...
  }

  public doesItNeedToBeRun(): boolean {
    return true; // @todo
  }

  public async generate(): Promise<void> {
    const source = createSource(this.job.source);

    logger.debug(`Generating backup using [${source.name}]...`);
    const path = await source.handle();
    logger.debug('Backup generation done.');

    const provider = createProvider(this.job.provider);
    logger.debug(`Uploading file from [${source.name}:${path}] using [${provider.name}]...`);
    provider.handle(source, path);
    logger.debug(`Upload done [${source.name}:${path}]`);
  }

  public async handle() {
    if (this.doesItNeedToBeRun()) {
      logger.info(`Handling job [${this.job.name}]...`);
      await this.generate();
      logger.info('Job finished.');
      return;
    }

    logger.warn(`Skipped job [${this.job.name}]`);
  }
}
