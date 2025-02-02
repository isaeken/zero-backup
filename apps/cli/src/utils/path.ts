import * as os from 'node:os';

export function getTempPath(path: string): string {
  if (os.type() === 'Windows_NT') {
    return `C:\\Windows\\Temp\\${path}`;
  }

  if (['Darwin', 'Linux'].includes(os.type())) {
    return `/tmp/${path}`;
  }

  throw new Error('Unsupported OS');
}
