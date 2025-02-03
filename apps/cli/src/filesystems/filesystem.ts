import { TFileSystemProviderOptions } from '@zero-backup/shared-types/fileystem.ts';

export abstract class FileSystem<T = TFileSystemProviderOptions> {
  public abstract name: string;

  public constructor(public config: T) {
    // ...
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract write(path: string, content: string): Promise<void>;

  public abstract read(path: string): Promise<string>;

  public abstract exists(path: string): Promise<boolean>;

  public abstract delete(path: string): Promise<void>;

  public abstract list(path: string): Promise<string[]>;

  public abstract mkdir(path: string): Promise<void>;

  public abstract copy(source: string, destination: string): Promise<void>;

  public abstract move(source: string, destination: string): Promise<void>;

  public abstract size(path: string): Promise<number>;

  public abstract hash(path: string): Promise<string>;

  public abstract backup(source: string, destination: string): Promise<string>;

  public abstract tempDirectory(): Promise<string>;

  public abstract get free(): Promise<number>;

  public abstract get used(): Promise<number>;

  public abstract get total(): Promise<number>;
}
