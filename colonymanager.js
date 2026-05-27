
export class ColonyManager {
    constructor() {
        this.resources = { 
            biomass: 200,    // Representa os Mantimentos/Comida (food.png)
            copper: 150,     // Representa a Madeira (wood.png)
            steam: 100,      // Nível de Vapor/Calor contra o frio
            population: 30,  // População atual
            defense: 10      // Defesa total oferecida pelas Muralhas
        };
        
        this.day = 1;

        // Catálogo de Construções atualizado com as suas imagens e nomes nativos
        this.buildings = [
            { id: 'house', name: 'Cabana', count: 1, cost: { copper: 50 }, prod: 'population', rate: 2, icon: 'house.png' },
            { id: 'farm', name: 'Fazenda', count: 1, cost: { copper: 40 }, prod: 'biomass', rate: 6, icon: 'farm.png' },
            { id: 'incubator', name: 'Incubadora', count: 0, cost: { copper: 100 }, prod: 'biomass', rate: 18, icon: 'food.png' },
            { id: 'wall', name: 'Muralha', count: 1, cost: { copper: 60 }, prod: 'defense', rate: 15, icon: 'wall.png' }
        ];
        
        this.init();
    }

    // --- GETTERS E SETTERS DE COMPATIBILIDADE PARA O CRISISSYSTEM ---
    get name() { return "Feudo Brutal"; }
    get defense() { return this.resources.defense; }
    set defense(value) { this.resources.defense = value; }
    get copper() { return this.resources.copper; }
    set copper(value) { this.resources.copper = value; }
    get biomass() { return this.resources.biomass; }
    set biomass(value) { this.resources.biomass = value; }
    get population() { return this.resources.population; }
    set population(value) { this.resources.population = value; }

    init() {
        // Inicia o loop de sobrevivência (1 tick = 2 segundos)
        setInterval(() => this.simulationTick(), 2000);
        
        // Configura os listeners de clique nos botões do index.html
        this.setupInteractions();
        this.updateUI();
    }

    setupInteractions() {
        // Seleciona os botões de construção baseados no atributo data-building
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const buildingId = btn.getAttribute('data-building');
                if (buildingId) this.buildStructure(buildingId);
            });
        });
    }

    simulationTick() {
        // 1. Frostpunk Core: Consumo passivo de Vapor pelo frio extremo
        this.resources.steam = Math.max(0, this.resources.steam - 4);

        // 2. Biopunk Core: População consome Mantimentos (Biomassa) para não morrer
        this.resources.biomass = Math.max(0, this.resources.biomass - Math.floor(this.resources.population * 0.2));

        // 3. Tarefa Ativa: Produção passiva de Madeira (Copper) feita pelos colonos livres
        this.resources.copper += Math.floor(this.resources.population * 0.1) + 2;

        // 4. Produção dos Edifícios de Comida (Só produzem se houver um mínimo de calor/vapor)
        if (this.resources.steam > 10) {
            this.buildings.forEach(b => {
                if (b.prod === 'biomass') {
                    this.resources.biomass += b.rate * b.count;
                }
            });
        }

        // 5. Estados de Crise Críticos por falta de recursos
        if (this.resources.steam <= 0) {
            this.resources.population = Math.max(0, this.resources.population - 2);
            Events.emit('COMBAT_LOG', { text: "🚨 CONGELAMENTO: Setores sem vapor! População a sucumbir.", type: 'critical' });
        }

        if (this.resources.biomass <= 0) {
            this.resources.population = Math.max(0, this.resources.population - 1);
            Events.emit('COMBAT_LOG', { text: "💀 FOME: Escassez crítica de mantimentos no feudo.", type: 'critical' });
        }

        this.updateUI();
    }

    buildStructure(buildingId) {
        const b = this.buildings.find(item => item.id === buildingId);
        if (!b) return;

        // Todas as construções usam Madeira (copper) como recurso de engenharia
        if (this.resources.copper >= b.cost.copper) {
            this.resources.copper -= b.cost.copper;
            b.count++;
            
            // Aplica os efeitos imediatos de cada construção
            if (b.id === 'wall') {
                this.resources.defense += b.rate;
                Events.emit('COMBAT_LOG', { text: `🧱 Muralha reforçada! Proteção aumentada em +${b.rate}.` });
            } else if (b.id === 'house') {
                this.resources.population += b.rate; // Novas cabanas abrigam e atraem colonos
                Events.emit('COMBAT_LOG', { text: `🛖 Nova Cabana erguida! +${b.rate} Colonos abrigados.` });
            } else if (b.id === 'incubator') {
                Events.emit('COMBAT_LOG', { text: `🧪 Incubadora Ativada! Produção biológica de alta eficiência iniciada.` });
            } else {
                Events.emit('COMBAT_LOG', { text: `🛠️ Estrutura expandida: +1 ${b.name} (Total: ${b.count})` });
            }
            
            this.updateUI();
        } else {
            Events.emit('COMBAT_LOG', { text: `❌ Madeira insuficiente para construir ${b.name}! Requer ${b.cost.copper} unidades.` });
        }
    }

    advanceDay() {
        this.day++;
        
        // Comunica o avanço do dia para o CrisisSystem.js processar as invasões nos dias múltiplos de 10
        Events.emit('DAY_ADVANCED', { day: this.day, activeCity: this });
        
        this.updateUI();
    }

    updateUI() {
        // Atualiza os contadores principais lidando com IDs antigos e novos de forma segura
        const biomassEl = document.getElementById('res-biomass') || document.getElementById('res-food');
        if (biomassEl) biomassEl.innerText = Math.floor(this.resources.biomass);

        const copperEl = document.getElementById('res-copper') || document.getElementById('res-wood');
        if (copperEl) copperEl.innerText = Math.floor(this.resources.copper);

        const popEl = document.getElementById('res-population');
        if (popEl) popEl.innerText = this.resources.population;

        const steamEl = document.getElementById('colony-steam');
        if (steamEl) steamEl.innerText = `${this.resources.steam} / 100`;

        // Preenche a barra visual de calor (se existir)
        const meter = document.getElementById('steam-meter') || document.getElementById('bar-warmth');
        if (meter) meter.style.width = `${this.resources.steam}%`;
        
        // Atualiza os painéis informativos de passagem do tempo
        const dayCounter = document.getElementById('day-counter') || document.getElementById('time-day');
        if (dayCounter) {
            dayCounter.innerText = `DIA ${this.day.toString().padStart(2, '0')}`;
        }
        
        // Calcula e exibe quantos dias faltam para a próxima horda (ciclos de 10 dias)
        const daysLeftEl = document.getElementById('days-left');
        if (daysLeftEl) {
            const daysLeft = 10 - (this.day % 10 === 0 ? 10 : this.day % 10);
            daysLeftEl.innerText = daysLeft;
        }
        
        // Atualização visual do painel de temperatura
        const tempText = document.getElementById('colony-temp');
        if (tempText) {
            if (this.resources.steam < 30) {
                tempText.innerText = "🚨 CONGELAMENTO";
                tempText.className = "text-red-600 font-bold animate-pulse";
            } else {
                tempText.innerText = "🔥 ESTÁVEL";
                tempText.className = "text-orange-500 font-bold";
            }
        }
    }
}
