import { db } from './firebase';
import { Sprint } from '../types/sprint';
import firebase from 'firebase/compat/app';

const SPRINTS_COLLECTION = 'sprints';

export const sprintService = {
  // Save a new sprint
  saveSprint: async (sprint: Omit<Sprint, 'id'>): Promise<string> => {
    try {
      const sprintRef = await db.collection(SPRINTS_COLLECTION).add({
        ...sprint,
        completedAt: firebase.firestore.Timestamp.fromDate(sprint.completedAt)
      });
      return sprintRef.id;
    } catch (error) {
      console.error('Error in saveSprint:', error);
      throw error;
    }
  },

  // Get user's sprints
  getUserSprints: async (userId: string): Promise<Sprint[]> => {
    try {
      const sprintsRef = db.collection(SPRINTS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc');
      
      const snapshot = await sprintsRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: (doc.data().completedAt as firebase.firestore.Timestamp).toDate()
      })) as Sprint[];
    } catch (error) {
      console.error('Error in getUserSprints:', error);
      throw error;
    }
  }
};