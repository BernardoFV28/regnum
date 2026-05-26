import { Position } from '../core/Components.js';
import { Inventory, StorageBuilding } from '../economy/EconomyComponents.js';

export class BuildingFactory {
    constructor(ecsManager, spatialGrid) {
        this.ecs = ecsManager;
        this.grid = spatialGrid;
    }

    createStockpile(x, y) {
        const entityId = this.ecs.createEntity();
        
        this.ecs.addComponent(entityId, 'Position', new Position(x, y));
        // Um stockpile é apenas um inventário gigante no chão
        this.ecs.addComponent(entityId, 'Inventory', new Inventory(1000));
        this.ecs.addComponent(entityId, 'StorageBuilding', new StorageBuilding('STOCKPILE'));
        
        // Registra no grid espacial para a IA achar facilmente
        this.grid.insert(entityId, x, y, ['STOCKPILE']);
        
        window.Events.emit('BUILDING_CONSTRUCTED', { type: 'Stockpile', x, y });
        return entityId;
    }

    createResourceNode(type, x, y, amount) {
        const entityId = this.ecs.createEntity();
        this.ecs.addComponent(entityId, 'Position', new Position(x, y));
        
        // importado de EconomyComponents
        this.ecs.addComponent(entityId, 'ResourceNode', new ResourceNode(type, amount));
        
        this.grid.insert(entityId, x, y, [type]);
        return entityId;
    }
}