import { TBackupSourceOptions } from '@zero-backup/shared-types/source.ts';

export abstract class Source<T = TBackupSourceOptions> {
  public abstract name: string;

  public constructor(public source: T) {
    // ...
  }

  public abstract handle(): Promise<string>;
}
