// input/InputManager.js

export class InputManager {
    constructor(eventBus, ecsManager) {
        this.events = eventBus;
        this.ecs = ecsManager;
        this.buildMode = null;

        this.events.on('ENTER_BUILD_MODE', (data) => {
            this.buildMode = data.type;
            document.body.style.cursor = 'crosshair';
        });

        window.addEventListener('mousedown', (e) => this.handleMouseClick(e));
    }

    handleMouseClick(e) {
        // Ignora cliques na UI
        if (e.target.closest('#ui-layer > div')) return;

        const clickX = e.clientX; // + cameraX na implementação completa
        const clickY = e.clientY; // + cameraY

        if (this.buildMode) {
            // Executa a construção
            this.events.emit('REQUEST_CONSTRUCTION', { type: this.buildMode, x: clickX, y: clickY });
            this.buildMode = null;
            document.body.style.cursor = 'default';
        } else {
            // Lógica simples de Seleção (Raycasting simplificado)
            const entities = this.ecs.getEntitiesWith('Position');
            let selected = false;

            for (const id of entities) {
                const pos = this.ecs.getComponent(id, 'Position');
                const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
                
                // Raio de clique de 15 pixels
                if (dist < 15 && this.ecs.hasComponent(id, 'CitizenInfo')) {
                    const info = this.ecs.getComponent(id, 'CitizenInfo');
                    const needs = this.ecs.getComponent(id, 'Needs');
                    const task = this.ecs.getComponent(id, 'Task');
                    
                    this.events.emit('ENTITY_SELECTED', { id, info, needs, task });
                    selected = true;
                    break;
                }
            }

            if (!selected) {
                this.events.emit('ENTITY_SELECTED', { info: null }); // Limpa a seleção
            }
        }
    }
}