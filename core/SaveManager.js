export class SaveManager {
    constructor(ecsManager) {
        this.ecs = ecsManager;
    }

    saveGame(slotName = 'autosave') {
        const serializedState = {
            nextEntityId: this.ecs.nextEntityId,
            components: {}
        };

        // Extrai mapas para JSON
        for (const [compName, map] of this.ecs.components.entries()) {
            serializedState.components[compName] = Object.fromEntries(map);
        }

        localStorage.setItem(`save_${slotName}`, JSON.stringify(serializedState));
        window.Events.emit('GAME_SAVED');
    }
}