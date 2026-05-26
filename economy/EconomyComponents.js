export class Inventory {
    constructor(capacity) {
        this.items = {
            wood: 0,
            food: 0,
            stone: 0
        };
        this.capacity = capacity;
    }
}

export class ResourceNode {
    constructor(type, amount) {
        this.type = type; // 'TREE', 'BERRY_BUSH', 'IRON_VEIN'
        this.amount = amount;
        this.yield = type === 'TREE' ? 'wood' : 'food';
    }
}

export class StorageBuilding {
    constructor(type) {
        this.type = type; // 'GRANARY' (comida), 'STOCKPILE' (madeira/pedra)
    }
}