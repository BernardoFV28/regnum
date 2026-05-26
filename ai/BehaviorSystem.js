import { Task } from '../core/Components.js';

export function BehaviorSystem(ecs, deltaTime) {
    const citizens = ecs.getEntitiesWith('CitizenInfo');

    for (const id of citizens) {
        const info = ecs.getComponent(id, 'CitizenInfo');
        if (!info.isAlive) continue;

        const needs = ecs.getComponent(id, 'Needs');
        let currentTask = ecs.getComponent(id, 'Task');

        // Se já tem uma tarefa crítica, continua nela
        if (currentTask && (currentTask.type === 'EAT' || currentTask.type === 'SEEK_WARMTH')) {
            continue;
        }

        // 1. Sobrevivência: Avalia Fome
        if (needs.hunger < 30) {
            // IA busca comida. Na engine real, usaria o SpatialGrid para achar o celeiro mais próximo
            ecs.addComponent(id, 'Task', new Task('EAT'));
            continue;
        }

        // 2. Trabalho: Se não está morrendo e não tem tarefa, vai trabalhar
        if (!currentTask && info.profession === 'Lenhador') {
            ecs.addComponent(id, 'Task', new Task('CHOP_WOOD'));
        }
    }
}