import { TBackupProviderOptions } from './provider';
import { TBackupSourceOptions } from './source';

export type TBackup = {
  filename: string;
  size: number;
  hash: string;
  date: string;
  source: TBackupSourceOptions;
  provider: TBackupProviderOptions;
};
