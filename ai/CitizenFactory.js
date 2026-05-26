// ai/CitizenFactory.js
import { Position, CitizenInfo, Needs } from '../core/Components.js';

export class CitizenFactory {
    constructor(ecsManager) {
        this.ecs = ecsManager;
        // Listas para geração procedural
        this.firstNames = ["Aldous", "Bram", "Cedric", "Elara", "Fiona", "Gareth"];
        this.lastNames = ["Ferreiro", "Mão-Gélida", "do Bosque", "Sem-Terra"];
    }

    createCitizen(x, y) {
        const entityId = this.ecs.createEntity();
        
        const randomName = `${this.firstNames[Math.floor(Math.random() * this.firstNames.length)]} ${this.lastNames[Math.floor(Math.random() * this.lastNames.length)]}`;
        const randomAge = Math.floor(Math.random() * 40) + 16; // Entre 16 e 56 anos

        // Injeta os componentes na entidade
        this.ecs.addComponent(entityId, 'Position', new Position(x, y));
        this.ecs.addComponent(entityId, 'CitizenInfo', new CitizenInfo(randomName, randomAge));
        this.ecs.addComponent(entityId, 'Needs', new Needs());

        window.Events.emit('CITIZEN_BORN', { id: entityId, name: randomName });

        return entityId;
    }
}