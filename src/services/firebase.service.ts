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
     * Get paginated documents from a collection
     */
    static async getPaginated<T>(
        collectionName: string,
        pageSize: number,
        lastDoc: any = null,
        ...constraints: QueryConstraint[]
    ): Promise<{ data: T[]; lastVisible: any }> {
        try {
            const { limit, startAfter } = await import('firebase/firestore');

            const qConstraints = [...constraints, limit(pageSize)];
            if (lastDoc) {
                qConstraints.push(startAfter(lastDoc));
            }

            console.log(`getPaginated: Querying ${collectionName} with pageSize ${pageSize}`);
            const q = query(collection(db, collectionName), ...qConstraints);
            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];

            return { data, lastVisible };
        } catch (error) {
            console.error(`Error fetching paginated ${collectionName}:`, error);
            return { data: [], lastVisible: null };
        }
    }

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
    /**
     * Delete multiple documents in batches
     */
    static async deleteDocuments(collectionName: string, ids: string[]): Promise<boolean> {
        try {
            const batchSize = 500;
            const chunks = [];
            for (let i = 0; i < ids.length; i += batchSize) {
                chunks.push(ids.slice(i, i + batchSize));
            }

            const { writeBatch } = await import('firebase/firestore');

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(id => {
                    const docRef = doc(db, collectionName, id);
                    batch.delete(docRef);
                });
                await batch.commit();
            }
            return true;
        } catch (error) {
            console.error(`Error deleting documents from ${collectionName}:`, error);
            return false;
        }
    }

    /**
     * Recursively delete all documents in a collection
     * More robust for large collections than fetching all IDs first
     */
    static async deleteAllDocuments(collectionName: string): Promise<boolean> {
        try {
            const { writeBatch, limit } = await import('firebase/firestore');

            while (true) {
                // Get a batch of documents (limit 500)
                const q = query(collection(db, collectionName), limit(500));
                const snapshot = await getDocs(q);

                if (snapshot.size === 0) {
                    break; // No more documents
                }

                const batch = writeBatch(db);
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();

                // If we fetched fewer than 500, we are done
                if (snapshot.size < 500) {
                    break;
                }
            }
            return true;
        } catch (error) {
            console.error(`Error deleting all documents from ${collectionName}:`, error);
            return false;
        }
    }
    /**
     * Run a transaction
     */
    static async runTransaction<T>(
        updateFunction: (transaction: any) => Promise<T>
    ): Promise<T> {
        try {
            const { runTransaction } = await import('firebase/firestore');
            return await runTransaction(db, updateFunction);
        } catch (error) {
            console.error("Transaction failed:", error);
            throw error;
        }
    }
}


// Export common query helpers
import { limit } from 'firebase/firestore';
export { where, orderBy, query, limit };
