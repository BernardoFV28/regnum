// social-simulation.js - Mecanismo Psicossocial e Mutações de Massa
import { ComponentMask } from './ecs-core.js';

export class SocialSimulationSystem {
    constructor() {
        this.mutationThreshold = 0.65; // Ponto de viragem biológica
    }

    update(ecs, dt, globalState) {
        ecs.chunks.forEach(chunk => {
            if ((chunk.mask & ComponentMask.SocioPsychology) && (chunk.mask & ComponentMask.Vitals)) {
                const socio = chunk.storage.SocioPsychology;
                const vitals = chunk.storage.Vitals;

                for (let i = 0; i < chunk.size; i++) {
                    // 1. Impacto do Medo Coletivo na Sanidade Individual
                    let fearModifier = globalState.collectiveFear / 100.0;
                    socio.sanity[i] = Math.max(0, socio.sanity[i] - (1.2 * fearModifier * dt));

                    // 2. Disparador de Radicalização e Cultos Proibidos
                    if (socio.sanity[i] < 30) {
                        socio.fanaticism[i] = Math.min(100, socio.fanaticism[i] + (2.5 * dt));
                        socio.radicalization[i] = Math.min(100, socio.radicalization[i] + (1.8 * dt));
                    }

                    // 3. Progressão da Infeção e Mutação Industrial
                    if (vitals.infection[i] > 50) {
                        // A infeção corrói a lealdade e altera a produtividade
                        vitals.lealty[i] = Math.max(0, vitals.lealty[i] - (3.0 * dt));
                    }

                    // 4. Consequências Críticas: Dissidência Emergente
                    if (socio.radicalization[i] > 85 && Math.random() < 0.001) {
                        globalState.resources.population = Math.max(0, globalState.resources.population - 1);
                        window.Events.emit('COMBAT_LOG', { 
                            text: "SABOTAGEM: Um cidadão radicalizado imolou-se nos dutos de vapor.", 
                            type: 'critical' 
                        });
                        globalState.steamPressure = Math.max(0, globalState.steamPressure - 25);
                    }
                }
            }
        });
    }

    // Aplica mutações cirúrgicas na estrutura genética da população
    induceMassMutation(ecs, globalState) {
        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.InfectionVector) {
                const inf = chunk.storage.InfectionVector;
                for (let i = 0; i < chunk.size; i++) {
                    inf.sporeEmission[i] *= 1.5;
                    inf.necrosis[i] = Math.min(100, inf.necrosis[i] + 20);
                }
            }
        });
        window.Events.emit('HUD_FLASH', { text: "MUTAÇÃO: Tecido celular da colónia adaptou-se à atmosfera ácida.", color: '#00ff66' });
    }
}
