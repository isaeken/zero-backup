import { createConsola } from 'consola';
import { TConfig } from '@zero-backup/shared-types';
import { App } from '~/services/app';

export const logger = createConsola({
  level: 5
});

const config: TConfig = {
  jobs: [
    {
      name: 'Job 1',
      cron: '* * * * *',
      source: {
        driver: 'local',
        path: '/app'
      },
      provider: {
        driver: 'local',
        path: '/backups'
      }
    }
  ]
};

const app = new App(config);
app.run();
