import { TBackupProviderOptions } from '@zero-backup/shared-types/src';
import { Provider } from '~/providers/provider';
import { LocalProvider } from '~/providers/local-provider';

export function createProvider(provider: TBackupProviderOptions): Provider {
  if (provider.driver === 'local') {
    return new LocalProvider(provider);
  }

  throw new Error(`Unsupported provider type [${provider.driver}]`);
}
