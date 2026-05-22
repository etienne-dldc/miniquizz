import { resolve } from "@std/path";

/**
 * Same API as localStorage but storing data in as files
 */
export interface FileStorage extends Storage {
}

export function createFileStorage(folder: string): FileStorage {
  // Make sure folder exists
  Deno.mkdirSync(folder, { recursive: true });

  return {
    clear,
    getItem,
    setItem,
    removeItem,
    key,
    get length() {
      return getLength();
    },
  };

  function getFilePath(key: string): string {
    return resolve(folder, key);
  }

  function getItem(key: string): string | null {
    try {
      return Deno.readTextFileSync(getFilePath(key));
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }
      throw e;
    }
  }

  function setItem(key: string, value: string): void {
    Deno.writeTextFileSync(getFilePath(key), value);
  }

  function removeItem(key: string): void {
    try {
      Deno.removeSync(getFilePath(key));
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return;
      }
      throw e;
    }
  }

  function clear(): void {
    for (const file of Deno.readDirSync(folder)) {
      if (file.isFile) {
        Deno.removeSync(resolve(folder, file.name));
      }
    }
  }

  function key(index: number): string | null {
    const files = Array.from(Deno.readDirSync(folder)).filter((file) => file.isFile);
    if (index < 0 || index >= files.length) {
      return null;
    }
    return files[index].name;
  }

  function getLength(): number {
    return Array.from(Deno.readDirSync(folder)).filter((file) => file.isFile).length;
  }
}
