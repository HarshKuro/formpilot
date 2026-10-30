// Global mocks for Chrome extension APIs in Vitest tests

const storageState: Record<string, any> = {};

(globalThis as any).chrome = {
  storage: {
    local: {
      get: (keys: string | string[] | Record<string, any> | null, callback?: (items: any) => void) => {
        let result: Record<string, any> = {};
        if (typeof keys === 'string') {
          result[keys] = storageState[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(k => {
            result[k] = storageState[k];
          });
        } else if (keys === null || keys === undefined) {
          result = { ...storageState };
        }
        if (callback) callback(result);
        return Promise.resolve(result);
      },
      set: (items: Record<string, any>, callback?: () => void) => {
        Object.assign(storageState, items);
        if (callback) callback();
        return Promise.resolve();
      },
      remove: (keys: string | string[], callback?: () => void) => {
        if (typeof keys === 'string') {
          delete storageState[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(k => delete storageState[k]);
        }
        if (callback) callback();
        return Promise.resolve();
      },
      clear: (callback?: () => void) => {
        for (const k of Object.keys(storageState)) {
          delete storageState[k];
        }
        if (callback) callback();
        return Promise.resolve();
      }
    }
  },
  runtime: {
    getURL: (path: string) => `chrome-extension://test-id/${path}`,
    openOptionsPage: () => {},
    sendMessage: (_msg: any, callback?: (response: any) => void) => {
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    },
    onMessage: {
      addListener: () => {}
    }
  }
};
