import { Provider } from '~/providers/provider';
import { TLocalBackupProviderOptions } from '@zero-backup/shared-types/src';
import { Source } from '~/sources/source';

export class LocalProvider extends Provider<TLocalBackupProviderOptions> {
  public name = 'Local';

  public handle(source: Source, path: string)
  {
    // @todo: move files to target
  }
}
