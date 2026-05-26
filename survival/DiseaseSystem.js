export function DiseaseSystem(ecs, deltaTime) {
    const citizens = ecs.getEntitiesWith('Needs');

    for (const id of citizens) {
        const needs = ecs.getComponent(id, 'Needs');
        const info = ecs.getComponent(id, 'CitizenInfo');

        // Frio constante debilita o sistema imunológico
        if (needs.warmth < 20) {
            if (Math.random() < 0.05 * deltaTime) { // 5% de chance por hora fria
                ecs.addComponent(id, 'Disease', { type: 'Peste Negra', damagePerTick: 5.0 });
                window.Events.emit('CITIZEN_SICK', { name: info.name });
            }
        }
    }
}