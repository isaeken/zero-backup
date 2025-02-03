export type TFileSystemProvider =
  'local' |
  'sftp' |
  'ftp' |
  'azure' |
  'gcs' |
  'minio';

export type TLocalFileSystemProviderOptions = {
  driver: 'local';
};

export type TSFTPFileSystemProviderOptions = {
  driver: 'sftp';
  host: string;
  port: number;
  username: string;
  password: string;
};

export type TFTPFileSystemProviderOptions = {
  driver: 'ftp';
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
};

export type TAzureFileSystemProviderOptions = {
  driver: 'azure';
  connectionString: string;
  containerName: string;
};

export type TGoogleCloudFileSystemProviderOptions = {
  driver: 'gcs';
  projectId: string;
  keyFilename: string;
  bucketName: string;
};

export type TMinioFileSystemProviderOptions = {
  driver: 'minio';
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
};

export type TFileSystemProviderOptions =
  | TLocalFileSystemProviderOptions
  | TSFTPFileSystemProviderOptions
  | TFTPFileSystemProviderOptions
  | TAzureFileSystemProviderOptions
  | TGoogleCloudFileSystemProviderOptions
  | TMinioFileSystemProviderOptions;

export type TFileSystemOptions<T extends TFileSystemProvider> = Extract<
  TFileSystemProviderOptions,
  { driver: T }
>;
