import { useState, useEffect } from 'react';
import { loadingState } from '../services/loadingState';

export const useLoading = (key) => {
    const [isLoading, setIsLoading] = useState(loadingState.isLoading(key));

    useEffect(() => {
        const unsubscribe = loadingState.addListener(key, (loading) => {
            setIsLoading(loading);
        });

        return unsubscribe;
    }, [key]);

    return isLoading;
};