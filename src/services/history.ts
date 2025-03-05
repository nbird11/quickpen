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
    console.log(
      `[HistoryService] getSprints called for user ${userId}, limit: ${
        limit || "none"
      }`
    );

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

      console.log(`[HistoryService] Executing Firestore query for sprints`);
      const snapshot = await query.get();
      console.log(`[HistoryService] Query returned ${snapshot.size} documents`);

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

      console.log(
        `[HistoryService] Processed ${sprints.length} sprints:`,
        sprints.map((s) => ({
          id: s.id,
          wordCount: s.wordCount,
          timestamp: s.completedAt.toISOString(),
        }))
      );

      return sprints;
    } catch (error) {
      console.error("[HistoryService] Error getting sprints:", error);
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
    console.log(`[HistoryService] getSprint called for sprint ${sprintId}`);

    try {
      const doc = await db.collection("sprints").doc(sprintId).get();

      if (!doc.exists) {
        console.log(`[HistoryService] Sprint ${sprintId} not found`);
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

      console.log(`[HistoryService] Retrieved sprint ${sprintId}:`, {
        wordCount: sprint.wordCount,
        timestamp: sprint.completedAt.toISOString(),
        tags: sprint.tags,
      });

      return sprint;
    } catch (error) {
      console.error(
        `[HistoryService] Error getting sprint ${sprintId}:`,
        error
      );
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
    console.log(
      `[HistoryService] addTag called for sprint ${sprintId}, tag: "${tag}"`
    );

    try {
      const sprintRef = db.collection("sprints").doc(sprintId);

      // Get current tags
      console.log(
        `[HistoryService] Fetching current tags for sprint ${sprintId}`
      );
      const doc = await sprintRef.get();
      if (!doc.exists) {
        console.error(
          `[HistoryService] Sprint ${sprintId} not found when adding tag`
        );
        throw new Error("Sprint not found");
      }

      const currentTags = doc.data()?.tags || [];
      console.log(
        `[HistoryService] Current tags for sprint ${sprintId}:`,
        currentTags
      );

      // Check if tag already exists
      if (currentTags.includes(tag)) {
        console.log(
          `[HistoryService] Tag "${tag}" already exists on sprint ${sprintId}, skipping`
        );
        return; // Tag already exists, no need to add
      }

      // Add the new tag
      const newTags = [...currentTags, tag];
      console.log(
        `[HistoryService] Updating sprint ${sprintId} with new tags:`,
        newTags
      );
      await sprintRef.update({
        tags: newTags,
      });

      console.log(
        `[HistoryService] Successfully added tag "${tag}" to sprint ${sprintId}`
      );
    } catch (error) {
      console.error(
        `[HistoryService] Error adding tag "${tag}" to sprint ${sprintId}:`,
        error
      );
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
    console.log(
      `[HistoryService] removeTag called for sprint ${sprintId}, tag: "${tag}"`
    );

    try {
      const sprintRef = db.collection("sprints").doc(sprintId);

      // Get current tags
      console.log(
        `[HistoryService] Fetching current tags for sprint ${sprintId}`
      );
      const doc = await sprintRef.get();
      if (!doc.exists) {
        console.error(
          `[HistoryService] Sprint ${sprintId} not found when removing tag`
        );
        throw new Error("Sprint not found");
      }

      const currentTags = doc.data()?.tags || [];
      console.log(
        `[HistoryService] Current tags for sprint ${sprintId}:`,
        currentTags
      );

      // Remove the tag
      const newTags = currentTags.filter((t: string) => t !== tag);
      console.log(
        `[HistoryService] Updating sprint ${sprintId} with tags after removal:`,
        newTags
      );
      await sprintRef.update({
        tags: newTags,
      });

      console.log(
        `[HistoryService] Successfully removed tag "${tag}" from sprint ${sprintId}`
      );
    } catch (error) {
      console.error(
        `[HistoryService] Error removing tag "${tag}" from sprint ${sprintId}:`,
        error
      );
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
