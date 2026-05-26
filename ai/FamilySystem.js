export function FamilySystem(ecs, deltaTime) {
    const families = ecs.getEntitiesWith('Housing'); // Casas com famílias

    for (const id of families) {
        const house = ecs.getComponent(id, 'Housing');
        
        // Se a casa tem espaço, comida, e a felicidade média é alta, há chance de nascimento
        if (house.occupants.length >= 2 && house.occupants.length < house.capacity && house.food > 10) {
            if (Math.random() < 0.0001 * deltaTime) { // Chance procedural rara
                window.Events.emit('NEW_BABY_BORN', { houseId: id });
            }
        }
    }
}