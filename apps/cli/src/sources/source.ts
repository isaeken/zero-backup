import { TBackupSourceOptions } from '@zero-backup/shared-types/src';

export abstract class Source<T = TBackupSourceOptions> {
  public abstract name: string;

  public constructor(public source: T) {
    // ...
  }

  public abstract handle(): string;
}
