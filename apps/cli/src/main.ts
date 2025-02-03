import { TConfig } from '@zero-backup/shared-types/config.ts';
import { logger } from '~/services/logger.ts';
import { Job } from "~/services/job.ts";
import { createFileSystem } from '~/filesystems';

const config: TConfig = {
  jobs: [
    // {
    //   name: 'local files to local',
    //   cron: '* * * * *',
    //   backup: {
    //     type: 'filesystem',
    //     path: '/data',
    //     adapter: {
    //       driver: 'local',
    //     },
    //   },
    //   storage: {
    //     path: '/backups/backup-{date}.{extension}',
    //     adapter: {
    //       driver: 'local',
    //     },
    //   },
    // },
    //
    // {
    //   name: 'local files to ftp',
    //   cron: '* * * * *',
    //   backup: {
    //     type: 'filesystem',
    //     path: '/data',
    //     adapter: {
    //       driver: 'local',
    //     },
    //   },
    //   storage: {
    //     path: '/backups/backup-{date}.{extension}',
    //     adapter: {
    //       driver: 'ftp',
    //       host: 'ftp_server',
    //       port: 21,
    //       username: 'user',
    //       password: 'pass',
    //       secure: false,
    //     }
    //   },
    // },

    // {
    //   name: 'local files to sftp',
    //   cron: '* * * * *',
    //   backup: {
    //     type: 'filesystem',
    //     path: '/data',
    //     adapter: {
    //       driver: 'local',
    //     },
    //   },
    //   storage: {
    //     path: 'backup-{date}.{extension}',
    //     adapter: {
    //       driver: 'sftp',
    //       host: 'sftp_server',
    //       port: 22,
    //       username: 'foo',
    //       password: 'pass',
    //     }
    //   },
    // },
  ],
};

(async function main() {
  logger.debug('Starting...');

  for await (const job of config.jobs) {
    await new Job(job).handle();
  }

  // const source = createFileSystem({
  //   driver: 'local',
  // });
  //
  // const destination = createFileSystem({
  //   driver: 'local',
  // });
  //
  // await source.transfer(
  //   destination,
  //   '/Users/isaeken/PhpstormProjects/zero-backup/storage/data/file.txt',
  //   '/Users/isaeken/PhpstormProjects/zero-backup/storage/asd/file.txt',
  // );

  logger.debug('Finished.');
})();
