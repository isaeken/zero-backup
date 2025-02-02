import { TBackupSourceOptions } from '@zero-backup/shared-types/src';
import { Source } from '~/sources/source';
import { LocalSource } from '~/sources/local-source';

export function createSource(source: TBackupSourceOptions): Source {
  if (source.driver === 'local') {
    return new LocalSource(source);
  }

  throw new Error(`Unsupported source type [${source.driver}]`);
}
