import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling setInterval with proper cleanup
 * @param callback Function to be called on each interval
 * @param delay Delay in milliseconds between each call, or null to stop interval
 */
export function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = useRef<() => void>(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
