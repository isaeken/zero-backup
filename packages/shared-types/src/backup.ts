import { TBackupSourceOptions } from '@zero-backup/shared-types/source';
import { TBackupProviderOptions } from '@zero-backup/shared-types/provider';

export type TBackup = {
  filename: string;
  size: number;
  hash: string;
  date: string;
  source: TBackupSourceOptions;
  provider: TBackupProviderOptions;
};
