import { Provider } from '~/providers/provider.ts';
import { LocalProvider } from '~/providers/local-provider.ts';
import { TBackupProviderOptions } from '@zero-backup/shared-types/provider.ts';

export function createProvider(provider: TBackupProviderOptions): Provider {
  if (provider.driver === 'local') {
    return new LocalProvider(provider);
  }

  throw new Error(`Unsupported provider type [${provider.driver}]`);
}
