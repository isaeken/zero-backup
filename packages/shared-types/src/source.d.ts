export type TBackupSource = 'local' | 'ftp' | 'sftp' | 'database';

export type TLocalBackupSourceOptions = {
  driver: 'local';
  path: string;
};

export type TFTPBackupSourceOptions = {
  driver: 'ftp';
  host: string;
  port: number;
  username: string;
  password: string;
};

export type TSFTPBackupSourceOptions = {
  driver: 'sftp';
  host: string;
  port: number;
  username: string;
  password: string;
};

export type TDatabaseBackupSourceOptions = {
  driver: 'database';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type TBackupSourceOptions = {
  driver: TBackupSource;
} & (
  TLocalBackupSourceOptions |
  TFTPBackupSourceOptions |
  TSFTPBackupSourceOptions |
  TDatabaseBackupSourceOptions
);
