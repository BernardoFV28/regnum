
export class CinematicCrisisDirector {
    constructor() {
        this.activeCrisis = null;
        this.crisisDuration = 0;
    }

    triggerCrisis(type, globalState) {
        this.activeCrisis = type;
        this.crisisDuration = 30.0; // 30 segundos de colapso puro

        switch (type) {
            case 'ECLIPSE_MECANICO':
                globalState.collectiveFear = 100;
                globalState.resources.biomass = Math.max(0, globalState.resources.biomass - 50);
                window.Events.emit('HUD_FLASH', { text: "🌌 ECLIPSE: Os deuses biomecânicos drenam a tua força vital.", color: '#4d004d' });
                break;
                
            case 'FALHA_DO_NUCLEO':
                globalState.steamPressure = 10;
                window.Events.emit('HUD_FLASH', { text: "💥 FALHA CRÍTICA: Ruptura térmica nos vasos de pressão primários!", color: '#ff3300' });
                break;

            case 'TEMPESTADE_DE_CARNE':
                window.Events.emit('COMBAT_LOG', { text: "🌧️ Chove matéria orgânica corrupta sobre as fundações do império.", type: 'critical' });
                break;
        }
    }

    update(globalState, ecs, dt) {
        if (!this.activeCrisis) return;

        this.crisisDuration -= dt;
        if (this.crisisDuration <= 0) {
            window.Events.emit('COMBAT_LOG', { text: `O evento de ${this.activeCrisis} dissipou-se.`, type: 'normal' });
            this.activeCrisis = null;
        } else {
            // Punições contínuas aplicadas por frame durante a crise
            if (this.activeCrisis === 'TEMPESTADE_DE_CARNE') {
                globalState.resources.biomass += 3.5 * dt; // Ganha biomassa impura, mas espalha podridão
                ecs.chunks.forEach(chunk => {
                    if (chunk.mask & 32) { // InfectionVector
                        const inf = chunk.storage.InfectionVector;
                        for (let i = 0; i < chunk.size; i++) {
                            inf.rotLevel[i] = Math.min(100, inf.rotLevel[i] + (5.0 * dt));
                        }
                    }
                });
            }
        }
    }
}
