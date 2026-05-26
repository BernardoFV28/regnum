// colonymanager.js

export class ColonyManager {
    constructor() {
        // Estado consolidado e unificado do jogo
        this.day = 1;
        this.resources = { 
            name: "Núcleo Alfa",
            biomass: 200, 
            copper: 150, 
            steam: 100,
            maxSteam: 100, 
            population: 30, 
            defense: 40 
        };

        // Catálogo Expandido: 7 Construções Biopunk
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
        // Inicia o loop de sobrevivência (1 tick = 2 segundos)
        setInterval(() => this.simulationTick(), 2000);
        this.renderCityGrid();
        this.updateUI();
    }

    advanceDay() {
        this.day++;
        
        // Atualiza a UI dos dias
        document.getElementById('day-counter').innerText = `DIA ${this.day.toString().padStart(2, '0')}`;
        
        // Calcula quantos dias faltam para o ciclo de 10
        const daysLeft = 10 - (this.day % 10 === 0 ? 10 : this.day % 10);
        document.getElementById('days-left').innerText = daysLeft;
    }

    simulationTick() {
        // 1. Consumo passivo pelo frio extremo
        this.resources.steam -= 6; // Aumentado um pouco o desafio

        // 2. População consome Biomassa
        this.resources.biomass -= Math.floor(this.resources.population * 0.2);

        // 3. Produção dos Edifícios
        this.buildings.forEach(b => {
            if (this.resources.steam > 10) { // Só produzem se houver calor (Vapor > 10)
                this.resources[b.prod] += b.rate * b.count;
            }
        });

        // 4. Limita o Vapor ao máximo do núcleo
        if (this.resources.steam > this.resources.maxSteam) {
            this.resources.steam = this.resources.maxSteam;
        }

        // 5. Verificação de Crise
        if (this.resources.steam <= 0) {
            this.resources.steam = 0;
            this.resources.population -= 2; // Congelamento
            Events.emit('COMBAT_LOG', { text: "CRÍTICO: Setores sem vapor! População está a congelar.", type: 'critical' });
        }

        if (this.resources.biomass <= 0) {
            this.resources.biomass = 0;
            this.resources.population -= 1; // Fome orgânica
        }

        // Garante que os números não fiquem negativos na UI
        this.resources.biomass = Math.max(0, this.resources.biomass);
        this.resources.population = Math.max(0, this.resources.population);

        this.updateUI();
    }

    buildStructure(buildingId) {
        const b = this.buildings.find(item => item.id === buildingId);
        
        // Verifica se o jogador tem TODOS os recursos necessários
        let canAfford = true;
        for (let res in b.cost) {
            if (this.resources[res] < b.cost[res]) {
                canAfford = false;
                break;
            }
        }

        if (canAfford) {
            // Deduz os custos
            for (let res in b.cost) {
                this.resources[res] -= b.cost[res];
            }
            
            b.count++;
            Events.emit('COMBAT_LOG', { text: `Mutação concluída: +1 ${b.name}` });
            this.renderCityGrid();
            this.updateUI();
        } else {
            Events.emit('COMBAT_LOG', { text: "Recursos insuficientes para fundir metal e carne.", type: 'critical' });
        }
    }

    renderCityGrid() {
        const grid = document.getElementById('city-grid');
        grid.innerHTML = '';
        
        // Dicionário para traduzir as chaves na UI
        const trans = { copper: 'Cobre', biomass: 'Biomassa', steam: 'Vapor', population: 'Pessoas', defense: 'Defesa' };

        this.buildings.forEach(b => {
            // Formata o custo para aparecer bonitinho no botão (ex: "50 Cobre, 20 Biomassa")
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
        
        // Altera o estado visual baseado na temperatura
        const tempText = document.getElementById('colony-temp');
        if (this.resources.steam < 30) {
            tempText.innerText = "CONGELAMENTO CRÍTICO";
            tempText.className = "text-[10px] text-red-500 font-bold animate-pulse tracking-widest";
        } else {
            tempText.innerText = "ESTÁVEL";
            tempText.className = "text-[10px] text-orange-500 font-bold tracking-widest";
        }
    }
}
