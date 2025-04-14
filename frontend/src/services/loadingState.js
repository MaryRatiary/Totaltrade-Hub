class LoadingStateManager {
    constructor() {
        this.loadingStates = new Map();
        this.listeners = new Map();
    }

    setLoading(key, isLoading) {
        this.loadingStates.set(key, isLoading);
        this._notifyListeners(key);
    }

    isLoading(key) {
        return this.loadingStates.get(key) || false;
    }

    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    _notifyListeners(key) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            const isLoading = this.isLoading(key);
            listeners.forEach(callback => callback(isLoading));
        }
    }
}

export const loadingState = new LoadingStateManager();