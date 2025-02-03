import { TFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';

export type TBackupOptions = {
  type: 'filesystem';
  path: string;
  adapter: TFileSystemProviderOptions;
};

export type TStorageOptions = {
  path: string;
  adapter: TFileSystemProviderOptions;
};

export type TJobConfig = {
  name: string;
  cron: string;
  backup: TBackupOptions;
  storage: TStorageOptions;
};

export type TConfig = {
  jobs: TJobConfig[];
};
