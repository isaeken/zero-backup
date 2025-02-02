import { TBackupProviderOptions } from '@zero-backup/shared-types/provider.ts';
import { Source } from '~/sources/source.ts';

export abstract class Provider<T = TBackupProviderOptions> {
  public abstract name: string;

  public constructor(public source: T) {
    // ...
  }

  public abstract handle(source: Source, path: string): void;
}
