export function FireSystem(ecs, deltaTime) {
    const buildings = ecs.getEntitiesWith('Flammable');

    for (const id of buildings) {
        const flam = ecs.getComponent(id, 'Flammable');
        
        if (flam.isOnFire) {
            flam.integrity -= 2.0 * deltaTime;
            if (flam.integrity <= 0) {
                window.Events.emit('BUILDING_DESTROYED_BY_FIRE', { id });
            }
        } else if (Math.random() < flam.ignitionRisk * deltaTime) { // Risco no verão
            flam.isOnFire = true;
            window.Events.emit('FIRE_OUTBREAK', { id });
        }
    }
}