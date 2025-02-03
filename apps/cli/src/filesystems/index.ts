import { TFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';
import { FileSystem } from "~/filesystems/filesystem.ts";
import { LocalFileSystem } from "~/filesystems/local.ts";
import { SftpFileSystem } from "~/filesystems/sftp.ts";
import { FTPFilesystem } from "~/filesystems/ftp.ts";
import { AzureFilesystem } from "~/filesystems/azure.ts";
import { GoogleCloudFilesystem } from "~/filesystems/gcs.ts";
import { MinioFilesystem } from "~/filesystems/minio.ts";

export function createFileSystem(filesystem: TFileSystemProviderOptions): FileSystem {
  if (filesystem.driver === 'local') {
    return new LocalFileSystem(filesystem);
  }

  if (filesystem.driver === 'sftp') {
    return new SftpFileSystem(filesystem);
  }

  if (filesystem.driver === 'ftp') {
    return new FTPFilesystem(filesystem);
  }

  if (filesystem.driver === 'azure') {
    return new AzureFilesystem(filesystem);
  }

  if (filesystem.driver === 'gcs') {
    return new GoogleCloudFilesystem(filesystem);
  }

  if (filesystem.driver === 'minio') {
    return new MinioFilesystem(filesystem);
  }

  throw new Error(`Unsupported driver [${filesystem}]`);
}
