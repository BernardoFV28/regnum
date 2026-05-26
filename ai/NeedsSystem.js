// ai/NeedsSystem.js

export function NeedsSystem(ecs, deltaTime) {
    // Busca todas as entidades que possuem "Needs" e "CitizenInfo"
    const entities = ecs.getEntitiesWith('Needs');

    for (const entityId of entities) {
        const needs = ecs.getComponent(entityId, 'Needs');
        const info = ecs.getComponent(entityId, 'CitizenInfo');

        // Ignora cidadãos mortos
        if (!info || !info.isAlive) continue;

        // Drenagem passiva de recursos vitais
        // Em um jogo real, o multiplicador de 'warmth' seria afetado pelo clima atual (ex: Inverno drena 5x mais rápido)
        needs.hunger -= 2.0 * deltaTime;
        needs.warmth -= 1.5 * deltaTime;
        needs.energy -= 1.0 * deltaTime;

        // Regras de Sobrevivência Brutal
        if (needs.hunger <= 0) {
            needs.hunger = 0;
            executeDeath(ecs, entityId, info, 'Fome');
        }

        if (needs.warmth <= 0) {
            needs.warmth = 0;
            executeDeath(ecs, entityId, info, 'Congelamento');
        }
        
        // Limita os valores máximos de forma estrita
        if (needs.hunger > 100) needs.hunger = 100;
        if (needs.warmth > 100) needs.warmth = 100;
        if (needs.energy > 100) needs.energy = 100;
    }
}

function executeDeath(ecs, entityId, info, cause) {
    info.isAlive = false;
    
    // Removemos os componentes que não fazem mais sentido para um cadáver
    ecs.components.get('Needs').delete(entityId);
    
    // Dispara um evento global para que a UI, a Família e o Coveiro reajam
    window.Events.emit('CITIZEN_DIED', { 
        id: entityId, 
        name: info.name, 
        cause: cause 
    });
}