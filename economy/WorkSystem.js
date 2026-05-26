export function WorkSystem(ecs, deltaTime) {
    const workers = ecs.getEntitiesWith('Task');

    for (const id of workers) {
        const task = ecs.getComponent(id, 'Task');
        
        // Só trabalha se chegou no local
        if (!task.isAtTarget) continue;

        if (task.type === 'CHOP_WOOD') {
            const treeNode = ecs.getComponent(task.targetEntityId, 'ResourceNode');
            const inventory = ecs.getComponent(id, 'Inventory');

            if (treeNode && treeNode.amount > 0) {
                // Demora tempo para cortar. Progressão da tarefa.
                task.progress += deltaTime;
                if (task.progress >= 2.0) { // A cada 2 segundos simulados
                    treeNode.amount -= 1;
                    inventory.items.wood += 1;
                    task.progress = 0;
                    
                    if(treeNode.amount <= 0) {
                        // Árvore caiu
                        ecs.components.get('ResourceNode').delete(task.targetEntityId);
                        ecs.components.get('Task').delete(id); // Limpa tarefa para o Behavior System dar outra
                    }
                }
            }
        }
    }
}