import { Provider } from '~/providers/provider.ts';
import { Source } from '~/sources/source.ts';
import { TLocalBackupProviderOptions } from '@zero-backup/shared-types/provider.ts';

export class LocalProvider extends Provider<TLocalBackupProviderOptions> {
  public name = 'Local';

  public handle(source: Source, path: string)
  {
    // @todo: move files to target
  }
}
