// DirectorSystem.js - IA de Engajamento e Eventos Estruturados

export class GrandThreatDirector {
    constructor() {
        this.eventDatabase = [
            {
                id: 'mass_mutation',
                title: 'NÚCLEO HEPÁTICO EXPANSIVO',
                description: 'Os conduites subterrâneos de biomassa começaram a se fundir de forma descontrolada. Um coração vascular gigante está crescendo sob os tanques de cobre.',
                options: [
                    {
                        label: '[ ALIMENTAR A MASSA ORGÂNICA ]',
                        cost: 'Consome 100 de Cobre | +40% Infecção Passiva',
                        execute: (state) => {
                            state.resources.copper = Math.max(0, state.resources.copper - 100);
                            state.infectionSpreadMultiplier += 1.5;
                            state.resources.biomass += 300;
                        }
                    },
                    {
                        label: '[ EXTRAIR LÍQUIDO ALQUÍMICO ]',
                        cost: 'Mutila 5 Trabalhadores | Reduz a Insanidade Global',
                        execute: (state) => {
                            state.resources.population = Math.max(0, state.resources.population - 5);
                            state.resources.insanity = Math.max(0, state.resources.insanity - 35);
                        }
                    }
                ]
            },
            {
                id: 'fornalha_sufocada',
                title: 'PÂNICO NA LINHA DE VAPOR',
                description: 'Válvulas entupidas com tecido cicatrizal calcificado ameaçam estourar os dutos primários do setor leste da colônia.',
                options: [
                    {
                        label: '[ SOBRECARREGAR EXTRATORES ]',
                        cost: 'Zera a Pressão de Vapor | Salva a População',
                        execute: (state) => {
                            state.globalSteamPressure = 0;
                        }
                    },
                    {
                        label: '[ ENVIAR ENGENHEIROS CADAVÉRICOS ]',
                        cost: 'Perda de 3 Cidadãos | Mantém Produção Ativa',
                        execute: (state) => {
                            state.resources.population = Math.max(0, state.resources.population - 3);
                            state.globalSteamPressure = state.resources.maxSteam;
                        }
                    }
                ]
            }
        ];
    }

    evaluateGlobalThreat(ecs, globalState) {
        // Planejamento tático inteligente da Horda Inimiga a cada ciclo de 10 dias
        if (globalState.ticks % 6000 === 0) {
            this.triggerCalculatedSiege(globalState);
        }
    }

    triggerCalculatedSiege(globalState) {
        // A força calculada da horda inimiga escala de forma agressiva e não-linear
        const calculationStrength = Math.floor(globalState.ticks * 0.01) * 3;
        
        window.Events.emit('COMBAT_LOG', { 
            text: `[ALERTA RADAR] Horda Mecânica detectada avançando contra o flanco vulnerável. Força calculada: ${calculationStrength}.`, 
            type: 'critical' 
        });

        window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' });
        
        // Resolução matemática de combate baseada nas defesas ativas construídas no ECS
        setTimeout(() => {
            if (globalState.resources.defense >= calculationStrength) {
                const defenseLoss = Math.floor(calculationStrength * 0.4);
                globalState.resources.defense = Math.max(0, globalState.resources.defense - defenseLoss);
                globalState.resources.copper += Math.floor(calculationStrength * 2); // Reciclagem de sucata das carcaças
                window.Events.emit('COMBAT_LOG', { 
                    text: `[VITÓRIA VITÓRIA] As muralhas de osso resistiram ao cerco. Defesas remanescentes reduzidas em: -${defenseLoss}.`, 
                    type: 'stable' 
                });
            } else {
                const defenseDeficit = calculationStrength - globalState.resources.defense;
                globalState.resources.population = Math.max(0, globalState.resources.population - defenseDeficit);
                globalState.resources.defense = 0;
                globalState.resources.biomass = Math.floor(globalState.resources.biomass * 0.4); // Recursos saqueados/devorados
                window.Events.emit('COMBAT_LOG', { 
                    text: `[BRECHA] As linhas de contenção caíram! ${vulnerabilityIndex} perdas na população registadas.`, 
                    type: 'critical' 
                });
                window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' });
            }
            window.World.renderActiveCity();
        }, 3000);
    }

    triggerCinematicEvent(globalState) {
        const availableEvents = this.eventDatabase;
        const selected = availableEvents[Math.floor(Math.random() * availableEvents.length)];

        window.Events.emit('CRT_GLITCH', true);
        window.Events.emit('SCREEN_SHAKE', { intensity: 'light' });

        // Criação de Interface Dinâmica sem quebrar o estado de concorrência
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 font-mono transition-all duration-500';
        
        let optionsDom = '';
        selected.options.forEach((opt, index) => {
            optionsDom += `
                <button id="opt-${index}" class="w-full text-left p-4 border border-zinc-800 bg-zinc-950/70 hover:bg-red-950/30 hover:border-red-700 transition-all group">
                    <div class="text-amber-500 font-bold tracking-widest text-sm uppercase group-hover:text-red-400">${opt.label}</div>
                    <div class="text-zinc-500 text-[10px] mt-1 font-sans">${opt.cost}</div>
                </button>
            `;
        });

        modal.innerHTML = `
            <div class="max-w-xl w-full border border-red-900/60 bg-neutral-950 p-6 shadow-[0_0_60px_rgba(139,0,0,0.15)] rounded-none">
                <div class="text-red-600 font-black tracking-widest text-lg mb-2 border-b border-zinc-900 pb-3 uppercase">${selected.title}</div>
                <div class="text-zinc-400 text-xs leading-relaxed mb-6 font-serif">${selected.description}</div>
                <div class="flex flex-col gap-3">${optionsDom}</div>
            </div>
        `;

        document.body.appendChild(modal);

        selected.options.forEach((opt, index) => {
            document.getElementById(`opt-${index}`).addEventListener('click', () => {
                opt.execute(globalState);
                modal.remove();
                window.Events.emit('CRT_GLITCH', false);
                window.Events.emit('COMBAT_LOG', { text: `Crise resolvida: ${selected.title}` });
                window.World.renderActiveCity();
            });
        });
    }
}
