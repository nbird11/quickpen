import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Sprint } from "../types/sprint";
import { db } from "./firebase";

export const historyService = {
  /**
   * Get all sprints for a user
   *
   * @param userId - The user ID to get sprints for
   * @param limit - Optional limit for number of sprints to return
   * @returns Array of Sprint objects
   */
  getSprints: async (userId: string, limit?: number): Promise<Sprint[]> => {
    try {
      // Query sprints for this user, ordered by completion date (newest first)
      let query = db
        .collection("sprints")
        .where("userId", "==", userId)
        .where("completedAt", "!=", null)
        .orderBy("completedAt", "desc");

      // Apply limit if specified
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();

      // Convert to Sprint objects
      const sprints = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          completedAt: (
            data.completedAt as firebase.firestore.Timestamp
          ).toDate(),
        } as Sprint;
      });

      return sprints;
    } catch (error) {
      console.error("Error getting sprints:", error);
      throw error;
    }
  },

  /**
   * Get a specific sprint by ID
   *
   * @param sprintId - The ID of the sprint to get
   * @returns The Sprint object or null if not found
   */
  getSprint: async (sprintId: string): Promise<Sprint | null> => {
    try {
      const doc = await db.collection("sprints").doc(sprintId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      const sprint = {
        id: doc.id,
        ...data,
        completedAt: (
          data.completedAt as firebase.firestore.Timestamp
        ).toDate(),
      } as Sprint;

      return sprint;
    } catch (error) {
      console.error(`Error getting sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Add a tag to a sprint
   *
   * @param sprintId - The ID of the sprint to add the tag to
   * @param tag - The tag to add
   * @returns Promise that resolves when the tag is added
   */
  addTag: async (sprintId: string, tag: string): Promise<void> => {
    try {
      const sprintRef = db.collection("sprints").doc(sprintId);

      // Get current tags
      const doc = await sprintRef.get();
      if (!doc.exists) {
        throw new Error("Sprint not found");
      }

      const currentTags = doc.data()?.tags || [];

      // Check if tag already exists
      if (currentTags.includes(tag)) {
        return; // Tag already exists, no need to add
      }

      // Add the new tag
      const newTags = [...currentTags, tag];
      await sprintRef.update({
        tags: newTags,
      });
    } catch (error) {
      console.error(`Error adding tag to sprint:`, error);
      throw error;
    }
  },

  /**
   * Remove a tag from a sprint
   *
   * @param sprintId - The ID of the sprint to remove the tag from
   * @param tag - The tag to remove
   * @returns Promise that resolves when the tag is removed
   */
  removeTag: async (sprintId: string, tag: string): Promise<void> => {
    try {
      const sprintRef = db.collection("sprints").doc(sprintId);

      // Get current tags
      const doc = await sprintRef.get();
      if (!doc.exists) {
        throw new Error("Sprint not found");
      }

      const currentTags = doc.data()?.tags || [];

      // Remove the tag
      const newTags = currentTags.filter((t: string) => t !== tag);
      await sprintRef.update({
        tags: newTags,
      });
    } catch (error) {
      console.error(`Error removing tag from sprint:`, error);
      throw error;
    }
  },

  /**
   * Get sprints by date range
   *
   * @param userId - The user ID to get sprints for
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   * @returns Array of Sprint objects
   */
  getSprintsByDateRange: async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Sprint[]> => {
    try {
      // Convert dates to Firestore timestamps
      const startTimestamp = firebase.firestore.Timestamp.fromDate(startDate);
      const endTimestamp = firebase.firestore.Timestamp.fromDate(endDate);

      // Query sprints within the date range
      const snapshot = await db
        .collection("sprints")
        .where("userId", "==", userId)
        .where("completedAt", ">=", startTimestamp)
        .where("completedAt", "<=", endTimestamp)
        .orderBy("completedAt", "desc")
        .get();

      // Convert to Sprint objects
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: (
          doc.data().completedAt as firebase.firestore.Timestamp
        ).toDate(),
      })) as Sprint[];
    } catch (error) {
      console.error("Error getting sprints by date range:", error);
      throw error;
    }
  },
};
