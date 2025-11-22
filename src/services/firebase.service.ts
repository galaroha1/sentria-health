import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    setDoc
} from 'firebase/firestore';
import type { QueryConstraint, Unsubscribe, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firebase Firestore Service
 * Provides generic CRUD operations and real-time listeners
 */

export class FirestoreService {
    /**
     * Get all documents from a collection
     */
    static async getAll<T>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
        try {
            const q = constraints.length > 0
                ? query(collection(db, collectionName), ...constraints)
                : collection(db, collectionName);

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            return [];
        }
    }

    /**
     * Get a single document by ID
     */
    static async getById<T>(collectionName: string, id: string): Promise<T | null> {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching document ${id} from ${collectionName}:`, error);
            return null;
        }
    }

    /**
     * Add a new document
     */
    static async add<T extends DocumentData>(collectionName: string, data: T): Promise<string | null> {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error(`Error adding document to ${collectionName}:`, error);
            return null;
        }
    }

    /**
     * Set a document with a specific ID (creates or overwrites)
     */
    static async set<T extends DocumentData>(
        collectionName: string,
        id: string,
        data: T
    ): Promise<boolean> {
        try {
            const docRef = doc(db, collectionName, id);
            await setDoc(docRef, data);
            return true;
        } catch (error) {
            console.error(`Error setting document ${id} in ${collectionName}:`, error);
            return false;
        }
    }

    /**
     * Update an existing document
     */
    static async update<T extends DocumentData>(
        collectionName: string,
        id: string,
        data: Partial<T>
    ): Promise<boolean> {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data as DocumentData);
            return true;
        } catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error);
            return false;
        }
    }

    /**
     * Delete a document
     */
    static async delete(collectionName: string, id: string): Promise<boolean> {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return true;
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error);
            return false;
        }
    }

    /**
     * Subscribe to real-time updates for a collection
     */
    static subscribe<T>(
        collectionName: string,
        callback: (data: T[]) => void,
        ...constraints: QueryConstraint[]
    ): Unsubscribe {
        const q = constraints.length > 0
            ? query(collection(db, collectionName), ...constraints)
            : collection(db, collectionName);

        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            callback(data);
        }, (error) => {
            console.error(`Error in ${collectionName} subscription:`, error);
        });
    }

    /**
     * Subscribe to real-time updates for a single document
     */
    static subscribeToDoc<T>(
        collectionName: string,
        id: string,
        callback: (data: T | null) => void
    ): Unsubscribe {
        const docRef = doc(db, collectionName, id);

        return onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error(`Error in document ${id} subscription:`, error);
        });
    }
}

// Export common query helpers
export { where, orderBy, query };
