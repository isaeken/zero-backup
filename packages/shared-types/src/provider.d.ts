export type TBackupProvider = 'local' | 's3' | 'gcs' | 'azure' | 'ftp' | 'sftp';

export type TLocalBackupProviderOptions = {
  driver: 'local';
  path: string;
};

export type TS3BackupProviderOptions = {
  driver: 's3';
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export type TGCSBackupProviderOptions = {
  driver: 'gcs';
  bucket: string;
  projectId: string;
  keyFilename: string;
};

export type TAzureBackupProviderOptions = {
  driver: 'azure';
  container: string;
  accountName: string;
  accountKey: string;
};

export type TFTPBackupProviderOptions = {
  driver: 'ftp';
  host: string;
  port: number;
  username: string;
  password: string;
};

export type TSFTPBackupProviderOptions = {
  driver: 'sftp';
  host: string;
  port: number;
  username: string;
  password: string;
}

export type TBackupProviderOptions = {
  driver: TBackupProvider;
} & (
  TLocalBackupProviderOptions |
  TS3BackupProviderOptions |
  TGCSBackupProviderOptions |
  TAzureBackupProviderOptions |
  TFTPBackupProviderOptions |
  TSFTPBackupProviderOptions
);
