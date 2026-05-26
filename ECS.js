export class ECSManager {
    constructor() {
        this.nextEntityId = 1;
        this.components = new Map(); // Map<NomeDoComponente, Map<EntityID, Dados>>
        this.systems = [];
    }

    createEntity() {
        return this.nextEntityId++;
    }

    addComponent(entityId, componentName, data) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        this.components.get(componentName).set(entityId, data);
    }

    getComponent(entityId, componentName) {
        const compMap = this.components.get(componentName);
        return compMap ? compMap.get(entityId) : null;
    }

    hasComponent(entityId, componentName) {
        const compMap = this.components.get(componentName);
        return compMap ? compMap.has(entityId) : false;
    }
    
    // Retorna todos os IDs que possuem um componente específico (Útil para os Sistemas)
    getEntitiesWith(componentName) {
        const compMap = this.components.get(componentName);
        return compMap ? Array.from(compMap.keys()) : [];
    }

    addSystem(systemFunction) {
        this.systems.push(systemFunction);
    }

    update(deltaTime) {
        // Executa a lógica de IA, Fome, Clima, etc.
        for (const system of this.systems) {
            system(this, deltaTime);
        }
    }
}