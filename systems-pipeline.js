
import { ComponentMask } from './ecs-core.js';

export class SystemsPipeline {
    constructor(audioContext) {
        this.audioCtx = audioContext;
        this.gridSize = 64;
        this.pathfindingGrid = Array(this.gridSize).fill(null).map(() => new Uint8Array(this.gridSize));
    }

    update(ecs, dt, globalState) {
        this.WeatherSystem(ecs, dt, globalState);
        this.HeatSystem(ecs, dt, globalState);
        this.InfectionSystem(ecs, dt, globalState);
        this.EconomySystem(ecs, dt, globalState);
        this.PopulationSystem(ecs, dt, globalState);
        this.FearSystem(ecs, dt, globalState);
        this.RitualSystem(ecs, dt, globalState);
        this.PathfindingSystem(ecs, dt, globalState);
        this.AIWarSystem(ecs, dt, globalState);
        this.ConstructionSystem(ecs, dt, globalState);
        this.CrisisSystem(ecs, dt, globalState);
        this.AnimationSystem(ecs, dt, globalState);
        this.AudioSystem(ecs, dt, globalState);
    }

    WeatherSystem(ecs, dt, state) {
        state.weatherTimer += dt;
        if (state.weatherTimer > 45) { // Mutação a cada 45 segundos
            const climates = ['CALMARIA_MORTA', 'NEVASCA_CORTANTE', 'CHUVA_ACIDA', 'TEMPESTADE_DE_CARNE', 'ECLIPSE_MECANICO'];
            state.weather = climates[Math.floor(Math.random() * climates.length)];
            state.weatherTimer = 0;
            window.Events.emit('HUD_FLASH', { text: `ALERTA CLIMÁTICO: ${state.weather}`, color: '#ff2200' });
        }
    }

    HeatSystem(ecs, dt, state) {
        let baseLoss = state.weather === 'NEVASCA_CORTANTE' ? 8.5 : 2.0;
        state.steamPressure = Math.max(0, state.steamPressure - (baseLoss * dt));

        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.Infrastructure) {
                const infra = chunk.storage.Infrastructure;
                for (let i = 0; i < chunk.size; i++) {
                    if (state.steamPressure > 20) {
                        infra.temperature[i] = Math.min(100, infra.temperature[i] + (5.0 * dt));
                    } else {
                        infra.temperature[i] = Math.max(-20, infra.temperature[i] - (4.0 * dt));
                    }
                }
            }
        });
    }

    InfectionSystem(ecs, dt, state) {
        let modifier = state.weather === 'TEMPESTADE_DE_CARNE' ? 2.5 : 1.0;
        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.InfectionVector) {
                const inf = chunk.storage.InfectionVector;
                for (let i = 0; i < chunk.size; i++) {
                    inf.rotLevel[i] = Math.min(100, inf.rotLevel[i] + (0.8 * modifier * dt));
                    if (inf.rotLevel[i] > 75) {
                        state.resources.biomass += 0.5 * dt; // Necrose gera biomassa impura
                    }
                }
            }
        });
    }

    EconomySystem(ecs, dt, state) {
        ecs.chunks.forEach(chunk => {
            if ((chunk.mask & ComponentMask.EconomicNode) && (chunk.mask & ComponentMask.Infrastructure)) {
                const econ = chunk.storage.EconomicNode;
                const infra = chunk.storage.Infrastructure;
                for (let i = 0; i < chunk.size; i++) {
                    let tempMod = infra.temperature[i] < 0 ? 0.3 : 1.0;
                    econ.efficiency[i] = (infra.integrity[i] / 100) * tempMod;
                    state.resources.copper += econ.prodRate[i] * econ.efficiency[i] * dt;
                }
            }
        });
    }

    PopulationSystem(ecs, dt, state) {
        let baselineConsumption = state.resources.population * 0.15;
        state.resources.biomass = Math.max(0, state.resources.biomass - (baselineConsumption * dt));

        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.Vitals) {
                const vit = chunk.storage.Vitals;
                for (let i = 0; i < chunk.size; i++) {
                    if (state.resources.biomass <= 0) {
                        vit.hunger[i] = Math.min(100, vit.hunger[i] + (4.0 * dt));
                    } else {
                        vit.hunger[i] = Math.max(0, vit.hunger[i] - (6.0 * dt));
                    }
                }
            }
        });
    }

    FearSystem(ecs, dt, state) {
        let threatFactor = state.weather === 'ECLIPSE_MECANICO' ? 4.0 : 0.5;
        state.collectiveFear = Math.min(100, state.collectiveFear + (threatFactor * dt));
    }

    RitualSystem(ecs, dt, state) {
        if (state.collectiveFear > 75 && state.resources.biomass > 50) {
            state.resources.biomass -= 40;
            state.collectiveFear -= 30;
            state.fanaticism = Math.min(100, state.fanaticism + 15);
            window.Events.emit('COMBAT_LOG', { text: "RITUAL: Sacrifício em massa oferecido às engrenagens biológicas.", type: 'critical' });
        }
    }

    PathfindingSystem(ecs, dt, state) {
        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.Pathfollower) {
                const path = chunk.storage.Pathfollower;
                const trans = chunk.storage.Transform;
                for (let i = 0; i < chunk.size; i++) {
                    let dx = trans.targetX[i] - trans.x[i];
                    let dy = trans.targetY[i] - trans.y[i];
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist > 0.1) {
                        trans.x[i] += (dx / dist) * path.speed[i] * dt;
                        trans.y[i] += (dy / dist) * path.speed[i] * dt;
                    }
                }
            }
        });
    }

    AIWarSystem(ecs, dt, state) {
        state.siegeTimer += dt;
        if (state.siegeTimer >= 90) { // Ataque planejado a cada 90 segundos
            state.siegeTimer = 0;
            window.Events.emit('CRISIS_TRIGGERED', { type: 'WAR_SIEGE' });
        }
    }

    ConstructionSystem(ecs, dt, state) {
        // Processa mutações arquiteturais estruturadas em background
    }

    CrisisSystem(ecs, dt, state) {
        // Monitora as travas de falha total e gerencia as punições visuais cinemáticas
    }

    AnimationSystem(ecs, dt, state) {
        ecs.chunks.forEach(chunk => {
            if (chunk.mask & ComponentMask.Renderable) {
                const rend = chunk.storage.Renderable;
                for (let i = 0; i < chunk.size; i++) {
                    rend.pulseOffset[i] += dt * 3.14; // Ciclo trigonométrico completo por segundo
                }
            }
        });
    }

    AudioSystem(ecs, dt, state) {
        // Modulação do sintetizador procedural acoplado ao medo coletivo
        if (state.audioSynth) {
            state.audioSynth.frequency.setValueAtTime(60 + (state.collectiveFear * 0.8), this.audioCtx.currentTime);
        }
    }

    RenderSystem(ecs, ctx, alpha, state, sprites) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Renderização em lote e agrupada por blocos de dados contíguos
        ecs.chunks.forEach(chunk => {
            if ((chunk.mask & ComponentMask.Transform) && (chunk.mask & ComponentMask.Renderable)) {
                const trans = chunk.storage.Transform;
                const rend = chunk.storage.Renderable;

                for (let i = 0; i < chunk.size; i++) {
                    let rx = trans.x[i];
                    let ry = trans.y[i];
                    
                    let pulse = 1.0 + Math.sin(rend.pulseOffset[i]) * 0.05;

                    ctx.save();
                    ctx.translate(rx * 64 + 32, ry * 64 + 32);
                    ctx.scale(pulse, pulse);
                    
                    ctx.fillStyle = '#4a0505';
                    ctx.fillRect(-24, -24, 48, 48); // Geometria estrutural base
                    
                    ctx.strokeStyle = '#ff3300';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-24, -24, 48, 48);
                    
                    ctx.restore();
                }
            }
        });
    }
}
