import { TBackupSourceOptions } from './source';
import { TBackupProviderOptions } from './provider';

export type TJobConfig = {
  name: string;
  cron: string;
  source: TBackupSourceOptions;
  provider: TBackupProviderOptions;
};

export type TConfig = {
  jobs: TJobConfig[];
};

