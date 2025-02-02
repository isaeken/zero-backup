import { TBackupProviderOptions } from '@zero-backup/shared-types/src';
import { Source } from '~/sources/source';

export abstract class Provider<T = TBackupProviderOptions> {
  public abstract name: string;

  public constructor(public source: T) {
    // ...
  }

  public abstract handle(source: Source, path: string): void;
}
