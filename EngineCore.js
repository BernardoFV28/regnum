// EngineCore.js - Núcleo de Arquitetura AAA

export class ComponentRegistry {
    static IDs = {
        Transform: 1 << 0,
        Renderable: 1 << 1,
        Infrastructure: 1 << 2,
        SocioPsychology: 1 << 3,
        EconomicNode: 1 << 4,
        InfectionVector: 1 << 5
    };
}

class Archetype {
    constructor(mask) {
        this.mask = mask;
        this.entityIds = [];
        this.storage = new Map(); // ComponentName -> Array contíguo
    }

    initComponentStorage(componentName) {
        if (!this.storage.has(componentName)) {
            this.storage.set(componentName, []);
        }
    }

    addEntity(entityId, componentsData) {
        this.entityIds.push(entityId);
        for (const [compName, data] of Object.entries(componentsData)) {
            this.initComponentStorage(compName);
            this.storage.get(compName).push(JSON.parse(JSON.stringify(data)));
        }
    }

    removeEntity(entityId) {
        const index = this.entityIds.indexOf(entityId);
        if (index === -1) return null;

        // Swap with last para manter array contíguo O(1) sem lacunas de memória
        const isLast = index === this.entityIds.length - 1;
        this.entityIds[index] = this.entityIds[this.entityIds.length - 1];
        this.entityIds.pop();

        const removedData = {};
        for (const [compName, arr] of this.storage.entries()) {
            removedData[compName] = arr[index];
            if (isLast) {
                arr.pop();
            } else {
                arr[index] = arr[arr.length - 1];
                arr.pop();
            }
        }
        return removedData;
    }
}

export class HighPerformanceECS {
    constructor() {
        this.nextEntityId = 1;
        this.entitiesMap = new Map(); // entityId -> ArchetypeMask
        this.archetypes = new Map();  // ArchetypeMask -> Archetype
        this.systems = [];
    }

    getOrCreateArchetype(mask) {
        if (!this.archetypes.has(mask)) {
            this.archetypes.set(mask, new Archetype(mask));
        }
        return this.archetypes.get(mask);
    }

    createEntity(componentMask, initialData) {
        const entityId = this.nextEntityId++;
        this.entitiesMap.set(entityId, componentMask);
        const archetype = this.getOrCreateArchetype(componentMask);
        archetype.addEntity(entityId, initialData);
        return entityId;
    }

    destroyEntity(entityId) {
        const mask = this.entitiesMap.get(entityId);
        if (mask === undefined) return;
        const archetype = this.archetypes.get(mask);
        archetype.removeEntity(entityId);
        this.entitiesMap.delete(entityId);
    }

    registerSystem(systemInstance) {
        this.systems.push(systemInstance);
        this.systems.sort((a, b) => b.priority - a.priority);
    }

    updateSystems(dt, globalState) {
        for (const system of this.systems) {
            system.update(this, dt, globalState);
        }
    }
}

export class FixedTimestepLoop {
    constructor(updateFps = 60) {
        this.fps = updateFps;
        this.timestep = 1000 / this.fps; // Delta tempo fixo da simulação
        this.accumulatedTime = 0;
        this.lastFrameTime = 0;
        this.isRunning = false;
    }

    start(ecsInstance, globalState, renderCallback) {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        
        const loop = (currentTime) => {
            if (!this.isRunning) return;

            let deltaTime = currentTime - this.lastFrameTime;
            if (deltaTime > 250) deltaTime = 250; // Trava de pânico contra acumulação infinita

            this.lastFrameTime = currentTime;
            this.accumulatedTime += deltaTime;

            // Ciclo de Atualização Fixa Determinística
            while (this.accumulatedTime >= this.timestep) {
                globalState.ticks++;
                ecsInstance.updateSystems(this.timestep / 1000, globalState);
                this.accumulatedTime -= this.timestep;
            }

            // Fator de Interpolação para suavização de quadros no Renderizador
            const interpolationAlpha = this.accumulatedTime / this.timestep;
            renderCallback(interpolationAlpha);

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    stop() {
        this.isRunning = false;
    }
}
