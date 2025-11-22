import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firebase.service';
import { QueryConstraint } from 'firebase/firestore';

/**
 * Custom hook for Firestore real-time data synchronization
 * @param collectionName - Firestore collection name
 * @param constraints - Optional query constraints (where, orderBy, etc.)
 * @returns {data, loading, error, refresh}
 */
export function useFirestore<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribe = FirestoreService.subscribe<T>(
            collectionName,
            (newData) => {
                setData(newData);
                setLoading(false);
                setError(null);
            },
            ...constraints
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [collectionName, ...constraints.map(c => JSON.stringify(c))]);

    const refresh = async () => {
        setLoading(true);
        try {
            const newData = await FirestoreService.getAll<T>(collectionName, ...constraints);
            setData(newData);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refresh };
}

/**
 * Custom hook for single document real-time synchronization
 */
export function useFirestoreDoc<T>(collectionName: string, docId: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!docId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = FirestoreService.subscribeToDoc<T>(
            collectionName,
            docId,
            (newData) => {
                setData(newData);
                setLoading(false);
                setError(null);
            }
        );

        return () => unsubscribe();
    }, [collectionName, docId]);

    return { data, loading, error };
}
