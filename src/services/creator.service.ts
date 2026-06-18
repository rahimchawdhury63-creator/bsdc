import { collection, onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore';
import { db } from '@config/firebase';
import { FIRESTORE_COLLECTIONS } from '@config/constants';

/** Creator dashboard aggregate calculated from real Firestore posts. */
export interface CreatorStats { readonly posts: number; readonly views: number; readonly likes: number; readonly comments: number; }

/** Subscribes to author posts and calculates creator analytics locally. */
export const subscribeToCreatorStats = (userId: string, callback: (stats: CreatorStats) => void): Unsubscribe => onSnapshot(query(collection(db, FIRESTORE_COLLECTIONS.posts), where('authorId', '==', userId)), (snapshot) => callback(snapshot.docs.reduce<CreatorStats>((stats, docSnap) => { const data = docSnap.data(); return { posts: stats.posts + 1, views: stats.views + Number(data.viewsCount || 0), likes: stats.likes + Number(data.likesCount || 0), comments: stats.comments + Number(data.commentsCount || 0) }; }, { posts: 0, views: 0, likes: 0, comments: 0 })));
