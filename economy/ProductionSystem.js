export function ProductionSystem(ecs, deltaTime) {
    const crafters = ecs.getEntitiesWith('ProductionBuilding');

    for (const id of crafters) {
        const prod = ecs.getComponent(id, 'ProductionBuilding');
        const inv = ecs.getComponent(id, 'Inventory');

        if (inv.items[prod.inputResource] >= prod.inputCost) {
            prod.progress += deltaTime;
            if (prod.progress >= prod.timeToCraft) {
                inv.items[prod.inputResource] -= prod.inputCost;
                inv.items[prod.outputResource] += prod.outputAmount;
                prod.progress = 0;
            }
        }
    }
}