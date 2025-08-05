export class OfflineManager {
  private static instance: OfflineManager;
  private db: IDBDatabase | null = null;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  async init() {
    this.db = await this.openDB();
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lms-ai-offline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', {
            keyPath: 'id',
          });
          actionStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', {
            keyPath: 'id',
          });
          progressStore.createIndex('userId', 'userId');
          progressStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('offlineContent')) {
          const contentStore = db.createObjectStore('offlineContent', {
            keyPath: 'id',
          });
          contentStore.createIndex('type', 'type');
          contentStore.createIndex('downloadedAt', 'downloadedAt');
        }
      };
    });
  }

  // Store offline action for later sync
  async storeOfflineAction(action: {
    id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    timestamp: number;
  }) {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('offlineActions', 'readwrite');
    const store = tx.objectStore('offlineActions');
    await store.put(action);
  }

  // Store learning progress offline
  async storeProgress(progress: {
    id: string;
    userId: string;
    courseId: string;
    lessonId: string;
    data: any;
    timestamp: number;
    synced: boolean;
  }) {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('progress', 'readwrite');
    const store = tx.objectStore('progress');
    await store.put(progress);
  }

  // Get unsynced progress
  async getUnsyncedProgress(): Promise<any[]> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('progress', 'readonly');
    const store = tx.objectStore('progress');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false as boolean & IDBValidKey);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark progress as synced
  async markProgressSynced(progressId: string) {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('progress', 'readwrite');
    const store = tx.objectStore('progress');

    const progress = await new Promise<any>((resolve, reject) => {
      const request = store.get(progressId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (progress) {
      progress.synced = true;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(progress);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Check if content is available offline
  async isContentAvailable(contentId: string): Promise<boolean> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('offlineContent', 'readonly');
    const store = tx.objectStore('offlineContent');
    const content = await store.get(contentId);

    return !!content;
  }

  // Get offline content
  async getOfflineContent(contentId: string): Promise<any> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction('offlineContent', 'readonly');
    const store = tx.objectStore('offlineContent');
    return await store.get(contentId);
  }
}

export const offlineManager = OfflineManager.getInstance();
