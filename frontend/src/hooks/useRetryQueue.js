import { useState, useEffect } from 'react';
import { retryQueue } from '../services/retryQueue';

export const useRetryQueue = () => {
    const [queueSize, setQueueSize] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const checkQueue = () => {
            setQueueSize(retryQueue.queue.size);
            setIsProcessing(retryQueue.isProcessing);
        };

        // Vérifier l'état initial
        checkQueue();

        // Mettre en place un intervalle pour vérifier l'état de la file d'attente
        const intervalId = setInterval(checkQueue, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return {
        hasItemsInQueue: queueSize > 0,
        queueSize,
        isProcessing
    };
};