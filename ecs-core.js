// ecs-core.js - Mecanismo de Arquitetura de Baixa Latência AAA
export const ComponentMask = {
    Transform: 1 << 0,
    Renderable: 1 << 1,
    Infrastructure: 1 << 2,
    SocioPsychology: 1 << 3,
    EconomicNode: 1 << 4,
    InfectionVector: 1 << 5,
    Pathfollower: 1 << 6,
    Vitals: 1 << 7
};

export class SparseSet {
    constructor(maxSize = 10000) {
        this.dense = new Uint32Array(maxSize);
        this.sparse = new Uint32Array(maxSize);
        this.size = 0;
    }
    add(x) {
        this.dense[this.size] = x;
        this.sparse[x] = this.size;
        this.size++;
    }
    has(x) {
        const index = this.sparse[x];
        return index < this.size && this.dense[index] === x;
    }
    remove(x) {
        if (!this.has(x)) return;
        const index = this.sparse[x];
        const lastX = this.dense[this.size - 1];
        this.dense[index] = lastX;
        this.sparse[lastX] = index;
        this.size--;
    }
}

export class Chunk {
    constructor(mask, capacity = 1024) {
        this.mask = mask;
        this.capacity = capacity;
        this.size = 0;
        this.entities = new Uint32Array(capacity);
        this.storage = {};
        
        this.initStorage();
    }

    initStorage() {
        if (this.mask & ComponentMask.Transform) {
            this.storage.Transform = {
                x: new Float32Array(this.capacity), y: new Float32Array(this.capacity),
                targetX: new Float32Array(this.capacity), targetY: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.Renderable) {
            this.storage.Renderable = {
                spriteId: new Uint8Array(this.capacity), frame: new Uint8Array(this.capacity),
                pulseOffset: new Float32Array(this.capacity), opacity: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.Infrastructure) {
            this.storage.Infrastructure = {
                tier: new Uint8Array(this.capacity), temperature: new Float32Array(this.capacity),
                integrity: new Float32Array(this.capacity), heatDemand: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.SocioPsychology) {
            this.storage.SocioPsychology = {
                classId: new Uint8Array(this.capacity), sanity: new Float32Array(this.capacity),
                fanaticism: new Float32Array(this.capacity), radicalization: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.EconomicNode) {
            this.storage.EconomicNode = {
                prodRate: new Float32Array(this.capacity), efficiency: new Float32Array(this.capacity),
                corruption: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.InfectionVector) {
            this.storage.InfectionVector = {
                rotLevel: new Float32Array(this.capacity), sporeEmission: new Float32Array(this.capacity),
                necrosis: new Float32Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.Pathfollower) {
            this.storage.Pathfollower = {
                speed: new Float32Array(this.capacity), progress: new Float32Array(this.capacity),
                currentNode: new Uint16Array(this.capacity)
            };
        }
        if (this.mask & ComponentMask.Vitals) {
            this.storage.Vitals = {
                hunger: new Float32Array(this.capacity), infection: new Float32Array(this.capacity),
                lealty: new Float32Array(this.capacity)
            };
        }
    }

    addEntity(entityId, initialData) {
        if (this.size >= this.capacity) return false;
        const index = this.size;
        this.entities[index] = entityId;

        for (const compName in initialData) {
            if (this.storage[compName]) {
                for (const prop in initialData[compName]) {
                    this.storage[compName][prop][index] = initialData[compName][prop];
                }
            }
        }
        this.size++;
        return true;
    }

    swapAndRemove(index) {
        const lastIndex = this.size - 1;
        this.entities[index] = this.entities[lastIndex];

        for (const compName in this.storage) {
            const component = this.storage[compName];
            for (const prop in component) {
                component[prop][index] = component[prop][lastIndex];
            }
        }
        this.size--;
    }
}

export class EngineECS {
    constructor() {
        this.entityMasks = new Uint32Array(20000);
        this.entityChunkIndex = new Uint32Array(20000);
        this.entityChunkRef = new Array(20000);
        this.freeIds = [];
        this.nextId = 1;
        this.chunks = [];
    }

    createEntity(mask, initialData) {
        let id;
        if (this.freeIds.length > 0) {
            id = this.freeIds.pop();
        } else {
            id = this.nextId++;
        }

        this.entityMasks[id] = mask;
        let targetChunk = this.chunks.find(c => c.mask === mask && c.size < c.capacity);
        if (!targetChunk) {
            targetChunk = new Chunk(mask);
            this.chunks.push(targetChunk);
        }

        targetChunk.addEntity(id, initialData);
        this.entityChunkRef[id] = targetChunk;
        this.entityChunkIndex[id] = targetChunk.size - 1;
        return id;
    }

    destroyEntity(id) {
        const mask = this.entityMasks[id];
        if (mask === 0) return;

        const chunk = this.entityChunkRef[id];
        const index = this.entityChunkIndex[id];
        
        chunk.swapAndRemove(index);
        
        if (index < chunk.size) {
            const movedEntityId = chunk.entities[index];
            this.entityChunkIndex[movedEntityId] = index;
        }

        this.entityMasks[id] = 0;
        this.entityChunkRef[id] = null;
        this.freeIds.push(id);
    }
}
