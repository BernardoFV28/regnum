// colonymanager.js

export class ColonyManager {
    constructor() {
        // Estado de Tempo e Atmosfera
        this.day = 1;
        this.weather = 'CALMARIA MORTA';
        
        // Estado Central e Psicológico
        this.resources = { 
            name: "Núcleo Alfa",
            biomass: 200, 
            copper: 150, 
            steam: 100,
            maxSteam: 100, 
            population: 30, 
            defense: 40,
            insanity: 0 // A métrica do desespero
        };

        // Catálogo de Construções Biopunk
        this.buildings = [
            { id: 'incubadora', name: 'Incubadora de Carne', count: 1, cost: { copper: 50 }, prod: 'biomass', rate: 5 },
            { id: 'extrator', name: 'Extrator de Cobre', count: 1, cost: { biomass: 60 }, prod: 'copper', rate: 3 },
            { id: 'caldeira', name: 'Caldeira de Sangue', count: 0, cost: { copper: 80, biomass: 40 }, prod: 'steam', rate: 8 },
            { id: 'casulo', name: 'Casulo de Gestação', count: 0, cost: { copper: 120, biomass: 150 }, prod: 'population', rate: 1 },
            { id: 'muralha', name: 'Muralha de Ossos', count: 0, cost: { copper: 100, biomass: 50 }, prod: 'defense', rate: 2 },
            { id: 'turbina', name: 'Turbina de Sucata', count: 0, cost: { biomass: 30 }, prod: 'copper', rate: 1 },
            { id: 'sintetizador', name: 'Sintetizador Celular', count: 0, cost: { copper: 250 }, prod: 'biomass', rate: 12 }
        ];
        
        this.init();
    }

    init() {
        // Inicia o ciclo vital: 1 tick = 2 segundos simulados
        setInterval(() => this.simulationTick(), 2000);
        this.renderCityGrid();
        this.updateUI();
    }

    advanceDay() {
        this.day++;
        
        // 1. Sistema Procedural de Clima Extremo (Roleta Viciada)
        const weathers = [
            { name: 'CALMARIA MORTA', chance: 50 },
            { name: 'NEVASCA CORTANTE', chance: 20 },
            { name: 'CHUVA ÁCIDA', chance: 20 },
            { name: 'ECLIPSE MECÂNICO', chance: 10 }
        ];
        
        const rand = Math.random() * 100;
        let sum = 0;
        for (let w of weathers) {
            sum += w.chance;
            if (rand <= sum) {
                this.weather = w.name;
                break;
            }
        }
        
        // Log visual da mudança climática
        let weatherColor = this.weather === 'CALMARIA MORTA' ? 'text-zinc-500' : 'text-amber-500';
        Events.emit('COMBAT_LOG', { text: `DIA ${this.day}: A atmosfera mudou para <span class="${weatherColor} font-bold">${this.weather}</span>.` });

        // 2. Acionador de Eventos Narrativos (25% de chance por dia)
        if (Math.random() < 0.25) {
            Events.emit('TRIGGER_NARRATIVE');
        }

        // 3. Atualização da Interface de Tempo
        document.getElementById('day-counter').innerText = `DIA ${this.day.toString().padStart(2, '0')}`;
        const daysLeft = 10 - (this.day % 10 === 0 ? 10 : this.day % 10);
        document.getElementById('days-left').innerText = daysLeft;
    }

    simulationTick() {
        // 1. Dreno Térmico Baseado no Clima
        let steamDrain = 6;
        if (this.weather === 'NEVASCA CORTANTE') steamDrain = 14; // Dobro do frio
        
        // 2. Degradação Psicológica Passiva
        if (this.weather === 'ECLIPSE MECÂNICO') this.resources.insanity += 2;
        if (this.resources.biomass <= 10) this.resources.insanity += 1; // Fome contínua gera loucura
        
        this.resources.steam -= steamDrain;
        this.resources.biomass -= Math.floor(this.resources.population * 0.2);

        // 3. Produção de Recursos (Afetada pelo Clima)
        let productionMultiplier = 1.0;
        if (this.weather === 'CHUVA ÁCIDA') productionMultiplier = 0.5; // Trabalhadores se escondem

        this.buildings.forEach(b => {
            // A Caldeira e Muralha operam 100% idependente da chuva, o resto cai pela metade
            let currentMult = (b.id === 'caldeira' || b.id === 'muralha') ? 1.0 : productionMultiplier;
            
            if (this.resources.steam > 10) { 
                this.resources[b.prod] += Math.floor((b.rate * b.count) * currentMult);
            }
        });

        // 4. Correção e Travas de Limites
        if (this.resources.steam > this.resources.maxSteam) this.resources.steam = this.resources.maxSteam;
        if (this.resources.insanity > 100) this.resources.insanity = 100;
        if (this.resources.insanity < 0) this.resources.insanity = 0;

        // 5. Verificações de Crise Letal
        if (this.resources.steam <= 0) {
            this.resources.steam = 0;
            this.resources.population -= 2; 
            Events.emit('COMBAT_LOG', { text: "CRÍTICO: O frio penetra a carne. -2 População.", type: 'critical' });
            window.Events.emit('SCREEN_SHAKE', { intensity: 'light' });
        }

        if (this.resources.biomass <= 0) {
            this.resources.biomass = 0;
            this.resources.population -= 1; 
        }

        // 6. O Evento de Loucura Máxima
        if (this.resources.insanity >= 80 && Math.random() < 0.15) {
            const deaths = Math.floor(Math.random() * 4) + 1;
            this.resources.population -= deaths;
            Events.emit('COMBAT_LOG', { text: `[ DELÍRIO ] ${deaths} cidadãos abraçaram as engrenagens e foram triturados.`, type: 'critical' });
            this.resources.insanity -= 25; // O derramamento de sangue acalma a colônia temporariamente
            window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' }); // Punição tátil
        }

        // Garante números positivos
        this.resources.biomass = Math.max(0, this.resources.biomass);
        this.resources.population = Math.max(0, this.resources.population);

        this.updateUI();
    }

    buildStructure(buildingId) {
        const b = this.buildings.find(item => item.id === buildingId);
        
        let canAfford = true;
        for (let res in b.cost) {
            if (this.resources[res] < b.cost[res]) {
                canAfford = false;
                break;
            }
        }

        if (canAfford) {
            for (let res in b.cost) {
                this.resources[res] -= b.cost[res];
            }
            
            b.count++;
            Events.emit('COMBAT_LOG', { text: `Sintetização concluída: +1 ${b.name}` });
            Events.emit('STRUCTURE_BUILT', { id: buildingId }); // Comunica o Canvas 2D
            
            this.renderCityGrid();
            this.updateUI();
        } else {
            Events.emit('COMBAT_LOG', { text: "Recursos orgânicos ou metálicos insuficientes para a mutação.", type: 'critical' });
        }
    }

    renderCityGrid() {
        const grid = document.getElementById('city-grid');
        grid.innerHTML = '';
        
        const trans = { copper: 'Cobre', biomass: 'Biomassa', steam: 'Vapor', population: 'Pessoas', defense: 'Defesa' };

        this.buildings.forEach(b => {
            const costString = Object.entries(b.cost)
                                     .map(([res, val]) => `${val} ${trans[res]}`)
                                     .join(' + ');

            grid.innerHTML += `
                <div class="panel p-3 border border-zinc-800 flex justify-between items-center bg-black/40 hover:bg-zinc-900/50 transition-colors">
                    <div>
                        <p class="text-zinc-200 font-bold text-sm tracking-wide">${b.name} <span class="text-amber-500">(x${b.count})</span></p>
                        <p class="text-[10px] text-zinc-500 font-mono mt-1">Gera: +${b.rate * b.count} ${trans[b.prod]}/tick</p>
                    </div>
                    <button onclick="window.Colony.buildStructure('${b.id}')" class="text-[10px] font-bold p-2 border border-amber-600/30 bg-amber-950/30 hover:bg-amber-900/60 hover:border-amber-500 text-amber-500 uppercase tracking-widest transition-all">
                        Cultivar [ ${costString} ]
                    </button>
                </div>
            `;
        });
    }

    updateUI() {
        document.getElementById('res-biomass').innerText = this.resources.biomass;
        document.getElementById('res-copper').innerText = this.resources.copper;
        document.getElementById('res-population').innerText = this.resources.population;
        document.getElementById('colony-steam').innerText = `${this.resources.steam} / ${this.resources.maxSteam}`;
        
        const meter = document.getElementById('steam-meter');
        meter.style.width = `${(this.resources.steam / this.resources.maxSteam) * 100}%`;
        
        const tempText = document.getElementById('colony-temp');
        if (this.resources.steam < 30) {
            tempText.innerText = "CONGELAMENTO CRÍTICO";
            tempText.className = "text-[10px] text-red-500 font-bold animate-pulse tracking-widest";
        } else {
            tempText.innerText = "ESTÁVEL";
            tempText.className = "text-[10px] text-orange-500 font-bold tracking-widest";
        }

        // Lógica de injeção dinâmica de alerta de Insanidade no log (caso o HUD não suporte a barra de sanidade ainda)
        if (this.resources.insanity > 75) {
            tempText.innerText = "RISCO DE MOTIM";
            tempText.className = "text-[10px] text-purple-500 font-bold animate-pulse tracking-widest";
        }
    }
}
