export class ColonyManager {
    constructor() {
        this.resources = { biomass: 200, copper: 150, steam: 100, population: 30 };
        this.buildings = [
            { id: 'incubadora', name: 'Incubadora de Carne', count: 1, cost: { copper: 50 }, prod: 'biomass', rate: 5 },
            { id: 'extrator', name: 'Extrator de Cobre', count: 1, cost: { biomass: 60 }, prod: 'copper', rate: 3 }
        ];
        
        this.init();
    }

    init() {
        // Inicia o loop de sobrevivência (1 tick = 2 segundos)
        setInterval(() => this.simulationTick(), 2000);
        this.renderCityGrid();
        this.updateUI();
    }

    simulationTick() {
        // 1. Frostpunk Core: Consumo de Vapor passivo pelo frio extremo
        this.resources.steam -= 4;

        // 2. Biopunk Core: População consome Biomassa para não morrer
        this.resources.biomass -= Math.floor(this.resources.population * 0.2);

        // 3. Produção dos Edifícios
        this.buildings.forEach(b => {
            if (this.resources.steam > 10) { // Só produzem se houver calor
                this.resources[b.prod] += b.rate * b.count;
            }
        });

        // 4. Verificação de Crise (Mecânica de Sobrevivência)
        if (this.resources.steam <= 0) {
            this.resources.steam = 0;
            this.resources.population -= 2; // Pessoas congelam
            Events.emit('COMBAT_LOG', { text: "CRÍTICO: Setores sem vapor! População está a congelar.", type: 'critical' });
        }

        if (this.resources.biomass <= 0) {
            this.resources.biomass = 0;
            this.resources.population -= 1; // Fome orgânica
        }

        this.updateUI();
    }

    buildStructure(buildingId) {
        const b = this.buildings.find(item => item.id === buildingId);
        // Verifica se tem Cobre suficiente para expandir a raiz mecânica
        if (this.resources.copper >= b.cost.copper) {
            this.resources.copper -= b.cost.copper;
            b.count++;
            Events.emit('COMBAT_LOG', { text: `Cultivado com sucesso: +1 ${b.name}` });
            this.renderCityGrid();
            this.updateUI();
        } else {
            Events.emit('COMBAT_LOG', { text: "Recursos insuficientes para fundir metal e carne." });
        }
    }

    renderCityGrid() {
        const grid = document.getElementById('city-grid');
        grid.innerHTML = '';
        
        this.buildings.forEach(b => {
            grid.innerHTML += `
                <div class="panel p-3 border border-zinc-800 flex justify-between items-center bg-black/40">
                    <div>
                        <p class="text-white font-bold text-sm">${b.name} (x${b.count})</p>
                        <p class="text-[10px] text-gray-500">Gera: +${b.rate * b.count} ${b.prod}/tick</p>
                    </div>
                    <button onclick="window.Colony.buildStructure('${b.id}')" class="text-xs p-1 px-2 border border-amber-600/50 hover:bg-amber-900/20 text-amber-500">
                        + Cultivar (Cost: ${b.cost.copper || b.cost.biomass})
                    </button>
                </div>
            `;
        });
    }

    updateUI() {
        document.getElementById('res-biomass').innerText = this.resources.biomass;
        document.getElementById('res-copper').innerText = this.resources.copper;
        document.getElementById('res-population').innerText = this.resources.population;
        document.getElementById('colony-steam').innerText = `${this.resources.steam} / 100`;
        
        const meter = document.getElementById('steam-meter');
        meter.style.width = `${this.resources.steam}%`;
        
        // Altera o estado visual baseado na temperatura
        const tempText = document.getElementById('colony-temp');
        if (this.resources.steam < 30) {
            tempText.innerText = "CONGELAMENTO";
            tempText.className = "text-red-600 font-bold animate-pulse";
        } else {
            tempText.innerText = "ESTÁVEL";
            tempText.className = "text-orange-500 font-bold";
        }
    }
    // Dentro do seu ColonyManager.js
constructor() {
    this.day = 1;
}

advanceDay() {
    this.day++;
    
    // Atualiza a UI dos dias
    document.getElementById('day-counter').innerText = `DIA ${this.day.toString().padStart(2, '0')}`;
    
    // Calcula quantos dias faltam para o ciclo de 10
    const daysLeft = 10 - (this.day % 10 === 0 ? 10 : this.day % 10);
    document.getElementById('days-left').innerText = daysLeft;

    // Dispara o Combate se for o Dia 10, 20, 30...
    if (this.day % 10 === 0) {
        document.getElementById('combat-overlay').classList.remove('hidden');
        Events.emit('COMBAT_LOG', { text: "⚠️ ALERTA: Horda se aproximando da muralha!", type: 'critical' });
    }
}
}