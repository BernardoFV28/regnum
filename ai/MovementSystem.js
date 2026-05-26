export function MovementSystem(ecs, deltaTime) {
    const movers = ecs.getEntitiesWith('Position');

    for (const id of movers) {
        const pos = ecs.getComponent(id, 'Position');
        const task = ecs.getComponent(id, 'Task');

        // Se tem tarefa e a tarefa tem um alvo físico
        if (task && task.targetEntityId) {
            const targetPos = ecs.getComponent(task.targetEntityId, 'Position');
            if (!targetPos) continue;

            const dx = targetPos.x - pos.x;
            const dy = targetPos.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Se está longe, move-se. Velocidade base: 2 unidades por segundo
            if (distance > 1.0) {
                const speed = 2.0 * deltaTime;
                pos.x += (dx / distance) * speed;
                pos.y += (dy / distance) * speed;
            } else {
                // Chegou no alvo. Outro sistema (WorkSystem) assumirá a extração.
                task.isAtTarget = true; 
            }
        }
    }
}