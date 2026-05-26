export class CrisisSystem {
    constructor() {
        // Ouve o sinal global de avanço de tempo
        Events.on('DAY_ADVANCED', (data) => this.checkCrisis(data.day, data.activeCity));
    }

    checkCrisis(globalDay, city) {
        // Se for múltiplo de 10, a Horda Ataca
        if (globalDay % 10 === 0) {
            this.triggerInvasion(globalDay, city);
        }
    }

    triggerInvasion(globalDay, city) {
        const combatOverlay = document.getElementById('combat-overlay');
        const logDisplay = document.getElementById('colony-log');
        
        // A força da horda escala com o tempo
        const hordeStrength = globalDay * 2; 
        
        combatOverlay.classList.remove('hidden');
        Events.emit('COMBAT_LOG', { text: `[ ALERTA CRÍTICO ] INVASORES NA MURALHA. Força estimada: ${hordeStrength}` });

        // Avaliação Automática de Defesa
        setTimeout(() => {
            if (city.defense >= hordeStrength) {
                this.resolveVictory(city, combatOverlay);
            } else {
                this.resolveDefeat(city, hordeStrength, combatOverlay);
            }
            window.World.renderActiveCity(); // Atualiza a UI após o ataque
        }, 4000); // Tensão de 4 segundos antes do resultado
    }

    resolveVictory(city, overlay) {
        overlay.classList.add('hidden');
        Events.emit('COMBAT_LOG', { text: `A Torre de Purgação incinerou a ameaça. A cidade sobrevive. (+50 Cobre)` });
        city.copper += 50; // Saque dos restos mecânicos
        
        // Consome um pouco da defesa (munição gasta)
        city.defense = Math.floor(city.defense * 0.5); 
    }

    resolveDefeat(city, hordeStrength, overlay) {
        overlay.classList.add('hidden');
        const casualties = Math.floor(hordeStrength - city.defense);
        
        city.population -= casualties;
        city.biomass = Math.floor(city.biomass * 0.5); // Horda saqueia comida
        city.defense = 0; // Muralhas destruídas

        if (city.population <= 0) {
            city.population = 0;
            Events.emit('COMBAT_LOG', { text: `FALHA CATASTRÓFICA: A população de ${city.name} foi dizimada.` });
        } else {
            Events.emit('COMBAT_LOG', { text: `BRECHA NA MURALHA: ${casualties} ciborgues mortos. 50% da Biomassa perdida.` });
        }
    }
}