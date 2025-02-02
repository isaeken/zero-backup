import { Source } from '~/sources/source.ts';
import { LocalSource } from '~/sources/local-source.ts';
import { TBackupSourceOptions } from '@zero-backup/shared-types/source.ts';

export function createSource(source: TBackupSourceOptions): Source {
  if (source.driver === 'local') {
    return new LocalSource(source);
  }

  throw new Error(`Unsupported source type [${source.driver}]`);
}
