class OfflineStorage {
    constructor() {
        this.dbName = 'tthOfflineDB';
        this.storeName = 'pendingRequests';
        this.db = null;
        this.init();
    }

    async init() {
        if (!window.indexedDB) {
            console.error('IndexedDB not supported');
            return;
        }

        try {
            this.db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, 1);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                    }
                };
            });
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
        }
    }

    async addPendingRequest(request) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.add({
                url: request.url,
                method: request.method,
                headers: request.headers,
                body: request.body,
                timestamp: Date.now()
            });

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async getPendingRequests() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async removePendingRequest(id) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async clearAll() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
}

export const offlineStorage = new OfflineStorage();