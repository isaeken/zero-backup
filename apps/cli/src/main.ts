import { TConfig } from '@zero-backup/shared-types/config.ts';
import { logger } from '~/services/logger.ts';
import { Job } from "~/services/job.ts";

const config: TConfig = {
  jobs: [
    {
      name: 'local files to local',
      cron: '* * * * *',
      backup: {
        type: 'filesystem',
        path: '/app',
        adapter: {
          driver: 'local',
        },
      },
      storage: {
        path: '/backups/{name}',
        adapter: {
          driver: 'local',
        },
      },
    },
  ],
};

(async function main() {
  logger.debug('Starting...');

  for await (const job of config.jobs) {
    await new Job(job).handle();
  }

  logger.debug('Finished.');
})();
