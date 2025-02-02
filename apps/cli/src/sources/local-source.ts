import { Source } from '~/sources/source';
import { TLocalBackupSourceOptions } from '@zero-backup/shared-types/src';

export class LocalSource extends Source<TLocalBackupSourceOptions> {
  public name = 'Local';

  public handle(): string
  {
    // @todo: generate a backup file for local directory

    return '';
  }
}
