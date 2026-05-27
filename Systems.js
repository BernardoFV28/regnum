// Systems.js - Lógica Avançada de Simulação

import { ComponentRegistry } from './EngineCore.js';

export class BaseSystem {
    constructor(priority = 10) {
        this.priority = priority;
    }
    update(ecs, dt, globalState) {}
}

export class AdvancedWeatherSystem extends BaseSystem {
    constructor() {
        super(100); // Altíssima Prioridade
        this.weatherCycles = ['CALMARIA_MORTA', 'NEVASCA_CORTANTE', 'CHUVA_ACIDA', 'TEMPESTADE_DE_CARNE', 'ECLIPSE_MECANICO'];
    }

    update(ecs, dt, globalState) {
        // Ciclo climático a cada 1000 ticks da simulação
        if (globalState.ticks % 1000 === 0) {
            const index = Math.floor(Math.random() * this.weatherCycles.length);
            globalState.currentWeather = this.weatherCycles[index];
            window.Events.emit('WEATHER_MUTATED', { type: globalState.currentWeather });
            window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' });
        }

        // Modificadores globais atmosféricos ativos
        switch (globalState.currentWeather) {
            case 'NEVASCA_CORTANTE':
                globalState.environmentalThermalModifier = -3.5;
                globalState.sanityDegradationRate = 1.2;
                break;
            case 'CHUVA_ACIDA':
                globalState.environmentalThermalModifier = -0.5;
                globalState.corrosionRate = 2.0;
                break;
            case 'TEMPESTADE_DE_CARNE':
                globalState.environmentalThermalModifier = 1.5;
                globalState.infectionSpreadMultiplier = 3.0;
                globalState.sanityDegradationRate = 2.5;
                break;
            case 'ECLIPSE_MECANICO':
                globalState.environmentalThermalModifier = -5.0;
                globalState.sanityDegradationRate = 4.0;
                break;
            default:
                globalState.environmentalThermalModifier = 0;
                globalState.sanityDegradationRate = 0.2;
        }
    }
}

export class AdvancedEconomySystem extends BaseSystem {
    constructor() {
        super(80);
    }

    update(ecs, dt, globalState) {
        const targetMask = ComponentRegistry.IDs.EconomicNode | ComponentRegistry.IDs.Infrastructure;

        for (const [mask, archetype] of ecs.archetypes.entries()) {
            if ((mask & targetMask) !== targetMask) continue;

            const econData = archetype.storage.get('EconomicNode');
            const infraData = archetype.storage.get('Infrastructure');

            for (let i = 0; i < archetype.entityIds.length; i++) {
                const node = econData[i];
                const structure = infraData[i];

                if (!structure.isOperational) continue;

                // Penalidade por eficiência térmica não linear utilizando sigmoide
                // Eficiência cai drasticamente se o vapor estiver abaixo do limite mínimo
                const thermalDeficit = Math.max(0, 50 - globalState.globalSteamPressure);
                const thermalEfficiency = 1 / (1 + Math.exp(thermalDeficit * 0.1));

                // Processamento de Cadeia de Produção
                let operationalInput = true;
                if (node.inputResource) {
                    if (globalState.resources[node.inputResource] >= node.inputCost * dt) {
                        globalState.resources[node.inputResource] -= node.inputCost * dt;
                    } else {
                        operationalInput = false;
                    }
                }

                if (operationalInput) {
                    const finalProduction = node.baseRate * node.count * thermalEfficiency * dt;
                    globalState.resources[node.outputResource] += finalProduction;
                }
            }
        }

        // Dreno metabólico de sobrevivência da população
        const populationConsumption = globalState.resources.population * 0.25 * dt;
        globalState.resources.biomass = Math.max(0, globalState.resources.biomass - populationConsumption);

        if (globalState.resources.biomass <= 0) {
            globalState.resources.population = Math.max(0, globalState.resources.population - (1.5 * dt));
            globalState.resources.insanity = Math.min(100, globalState.resources.insanity + (5 * dt));
        }
    }
}

export class SocioPsychologySystem extends BaseSystem {
    constructor() {
        super(70);
    }

    update(ecs, dt, globalState) {
        // Degradação e progressão da Insanidade Coletiva
        globalState.resources.insanity += globalState.sanityDegradationRate * dt;

        // Gatilhos de colapso psicológico estrutural
        if (globalState.resources.insanity >= 80) {
            globalState.resources.fanaticism = Math.min(100, globalState.resources.fanaticism + (2 * dt));
            globalState.resources.fear = Math.min(100, globalState.resources.fear + (3 * dt));

            if (Math.random() < 0.02) {
                const fatalEvents = Math.floor(Math.random() * 3) + 1;
                globalState.resources.population = Math.max(0, globalState.resources.population - fatalEvents);
                window.Events.emit('COMBAT_LOG', { 
                    text: `[COLAPSO] Delírio em massa: ${fatalEvents} trabalhadores sacrificaram-se nos eixos de transmissão mecânica.`, 
                    type: 'critical' 
                });
                window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' });
                globalState.resources.insanity -= 15;
            }
        } else {
            globalState.resources.fear = Math.max(0, globalState.resources.fear - (0.5 * dt));
        }

        globalState.resources.insanity = Math.max(0, Math.min(100, globalState.resources.insanity));
    }
}
