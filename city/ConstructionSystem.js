export function ConstructionSystem(ecs, deltaTime) {
    const sites = ecs.getEntitiesWith('Blueprint');

    for (const id of sites) {
        const bp = ecs.getComponent(id, 'Blueprint');
        if (bp.isFinished) continue;

        if (bp.currentWood >= bp.requiredWood && bp.currentStone >= bp.requiredStone) {
            bp.isFinished = true;
            // Transforma o canteiro de obras no edifício real
            ecs.components.get('Blueprint').delete(id);
            window.Events.emit('BUILDING_FINISHED', { id: id, type: bp.buildingType });
        }
    }
}