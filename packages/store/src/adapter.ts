/**
 * Platform-agnostic storage interface.
 * Web:    inject LocalStorageAdapter (uses window.localStorage)
 * Native: inject AsyncStorageAdapter (uses @react-native-async-storage/async-storage)
 */
export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * Native implementation — requires @react-native-async-storage/async-storage.
 * Import AsyncStorage from that package and pass it in:
 *
 *   import AsyncStorage from "@react-native-async-storage/async-storage";
 *   const adapter = new AsyncStorageAdapter(AsyncStorage);
 */
export class AsyncStorageAdapter implements StorageAdapter {
  constructor(
    private readonly storage: {
      getItem(key: string): Promise<string | null>;
      setItem(key: string, value: string): Promise<void>;
      removeItem(key: string): Promise<void>;
    }
  ) {}

  async get(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }
  async set(key: string, value: string): Promise<void> {
    return this.storage.setItem(key, value);
  }
  async remove(key: string): Promise<void> {
    return this.storage.removeItem(key);
  }
}

/** Web implementation — wraps localStorage in the async interface */
export class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  }
  async set(key: string, value: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  }
  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  }
}
