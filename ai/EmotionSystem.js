export function EmotionSystem(ecs, deltaTime) {
    const citizens = ecs.getEntitiesWith('Emotions');

    for (const id of citizens) {
        const em = ecs.getComponent(id, 'Emotions');
        const needs = ecs.getComponent(id, 'Needs');

        if (!needs) continue;

        // Fome reduz felicidade drasticamente
        if (needs.hunger < 50) em.happiness -= 0.5 * deltaTime;
        else if (needs.hunger > 80) em.happiness += 0.2 * deltaTime;

        // Limites
        em.happiness = Math.max(0, Math.min(100, em.happiness));

        if (em.happiness <= 0) {
            window.Events.emit('REBELLION_STARTED', { entityId: id });
        }
    }
}
