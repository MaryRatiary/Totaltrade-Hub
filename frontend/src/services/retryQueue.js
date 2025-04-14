import { getNetworkInfo, startNetworkMonitoring } from './networkUtils';

class RetryQueue {
    constructor() {
        this.queue = new Map();
        this.isProcessing = false;
        this.networkMonitorCleanup = null;
        this.setupNetworkMonitoring();
    }

    setupNetworkMonitoring() {
        this.networkMonitorCleanup = startNetworkMonitoring(({ online, apiAvailable }) => {
            if (online && apiAvailable && this.queue.size > 0) {
                this.processQueue();
            }
        });
    }

    async add(key, operation, maxAttempts = 5) {
        if (!this.queue.has(key)) {
            this.queue.set(key, {
                operation,
                attempts: 0,
                maxAttempts,
                lastAttempt: null
            });
        }

        if (!this.isProcessing) {
            await this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        for (const [key, item] of this.queue) {
            if (item.attempts >= item.maxAttempts) {
                this.queue.delete(key);
                continue;
            }

            // Check if we should wait before retrying
            const now = Date.now();
            if (item.lastAttempt) {
                const waitTime = this.getRetryDelay(item.attempts);
                const timeSinceLastAttempt = now - item.lastAttempt;
                if (timeSinceLastAttempt < waitTime) {
                    continue;
                }
            }

            try {
                await item.operation();
                this.queue.delete(key);
            } catch (error) {
                item.attempts++;
                item.lastAttempt = now;
                
                if (item.attempts >= item.maxAttempts) {
                    this.queue.delete(key);
                    throw error;
                }
            }
        }

        this.isProcessing = false;
        
        // If there are still items in the queue, schedule next processing
        if (this.queue.size > 0) {
            setTimeout(() => this.processQueue(), 1000);
        }
    }

    getRetryDelay(attempt) {
        const networkInfo = getNetworkInfo();
        const baseDelay = 1000;
        const maxDelay = 30000;

        // Adjust delay based on network type
        let multiplier = 1;
        switch (networkInfo.effectiveType) {
            case 'slow-2g':
                multiplier = 4;
                break;
            case '2g':
                multiplier = 3;
                break;
            case '3g':
                multiplier = 2;
                break;
            case '4g':
                multiplier = 1;
                break;
            default:
                multiplier = 2;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
            baseDelay * Math.pow(2, attempt) * multiplier,
            maxDelay
        );

        // Add jitter
        return delay + (Math.random() * 1000);
    }

    clear() {
        this.queue.clear();
        if (this.networkMonitorCleanup) {
            this.networkMonitorCleanup();
        }
    }
}

export const retryQueue = new RetryQueue();