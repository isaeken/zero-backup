import * as fs from 'node:fs';
import { Source } from '~/sources/source.ts';
import { getTempPath } from '~/utils/path.ts';
import { randomString } from '~/utils/random.ts';
import { TLocalBackupSourceOptions } from '@zero-backup/shared-types/source.ts';

export class LocalSource extends Source<TLocalBackupSourceOptions> {
  public name = 'Local';

  public async handle(): Promise<string>
  {
    const temp = getTempPath(randomString(16));
    if (! fs.existsSync(temp)) {
      fs.mkdirSync(temp, {recursive: true});
    }

    const output = temp + `/backup.tar.gz`;

    return '';
  }
}
