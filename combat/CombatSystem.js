export function CombatSystem(ecs, deltaTime) {
    const attackers = ecs.getEntitiesWith('CombatTask');

    for (const id of attackers) {
        const task = ecs.getComponent(id, 'CombatTask');
        const stats = ecs.getComponent(id, 'CombatStats');
        const targetHealth = ecs.getComponent(task.targetId, 'Health');

        if (targetHealth && task.isInMeleeRange) {
            // Cálculo de armadura (Mitigação)
            const targetStats = ecs.getComponent(task.targetId, 'CombatStats');
            const damage = Math.max(1, stats.attack - (targetStats ? targetStats.defense : 0));
            
            targetHealth.current -= damage * deltaTime; // Dano contínuo na simulação

            if (targetHealth.current <= 0) {
                ecs.components.get('CombatTask').delete(id); // Alvo morto
                window.Events.emit('ENTITY_SLAIN', { victim: task.targetId, killer: id });
            }
        }
    }
}