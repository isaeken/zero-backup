import { TBackupSourceOptions } from '@zero-backup/shared-types/source.ts';
import { TBackupProviderOptions } from '@zero-backup/shared-types/provider.ts';

export type TJobConfig = {
  name: string;
  cron: string;
  source: TBackupSourceOptions;
  provider: TBackupProviderOptions;
};

export type TConfig = {
  jobs: TJobConfig[];
};
