export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data = {}) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            for (const callback of callbacks) {
                callback(data); // Executa sem travar o loop principal
            }
        }
    }

    remove(event, callbackToRemove) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        this.listeners.set(event, callbacks.filter(cb => cb !== callbackToRemove));
    }
}