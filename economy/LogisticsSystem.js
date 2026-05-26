import { Task } from '../core/Components.js';

export function LogisticsSystem(ecs, deltaTime) {
    const workers = ecs.getEntitiesWith('Inventory');

    for (const id of workers) {
        const inv = ecs.getComponent(id, 'Inventory');
        const task = ecs.getComponent(id, 'Task');

        // Se o inventário do trabalhador está cheio, muda a tarefa para guardar
        if (inv && inv.items.wood >= inv.capacity && (!task || task.type !== 'STORE_ITEMS')) {
            // IA procura o ID do Stockpile mais próximo (simulado aqui como ID 999)
            ecs.addComponent(id, 'Task', new Task('STORE_ITEMS', 999));
        }

        if (task && task.type === 'STORE_ITEMS' && task.isAtTarget) {
            const storageInv = ecs.getComponent(task.targetEntityId, 'Inventory');
            if (storageInv) {
                storageInv.items.wood += inv.items.wood;
                inv.items.wood = 0;
                ecs.components.get('Task').delete(id); // Tarefa concluída
            }
        }
    }
}