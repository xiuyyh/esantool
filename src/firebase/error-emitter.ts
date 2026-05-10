type Listener = (error: any) => void;

class ErrorEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return () => {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    };
  }

  emit(event: string, data: any) {
    this.listeners[event]?.forEach(l => l(data));
  }
}

export const errorEmitter = new ErrorEmitter();
