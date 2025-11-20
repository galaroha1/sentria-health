import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
    timeout: number; // in milliseconds
    onIdle: () => void;
    disabled?: boolean;
}

export function useIdleTimer({ timeout, onIdle, disabled = false }: UseIdleTimerOptions) {
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const resetTimer = useCallback(() => {
        if (disabled) return;

        lastActivityRef.current = Date.now();

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        idleTimerRef.current = setTimeout(() => {
            onIdle();
        }, timeout);
    }, [timeout, onIdle, disabled]);

    useEffect(() => {
        if (disabled) return;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach((event) => {
            document.addEventListener(event, resetTimer);
        });

        resetTimer(); // Start timer on mount

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer);
            });
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [resetTimer, disabled]);

    const getRemainingTime = useCallback(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        return Math.max(0, timeout - elapsed);
    }, [timeout]);

    return { resetTimer, getRemainingTime };
}
