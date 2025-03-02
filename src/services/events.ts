export const EVENTS = {
  SPRINT_COMPLETED: 'sprint_completed'
};

type EventCallback = () => void;
type EventType = typeof EVENTS[keyof typeof EVENTS];

class EventService {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   * @param event The event to subscribe to
   * @param callback Function to call when the event occurs
   * @returns Unsubscribe function
   */
  subscribe(event: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event The event to emit
   */
  emit(event: EventType): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}

// Create singleton instance
export const eventService = new EventService(); 