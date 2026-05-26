// Dicionário Global de Construções Biomecânicas
const BUILDING_CATALOG = {
    'incubadora': { 
        id: 'incubadora', name: 'Incubadora de Carne', 
        cost: { copper: 50, biomass: 0 }, 
        prod: { biomass: 15, copper: 0, steam: 0, pop: 0, defense: 0 }, 
        consume: { steam: 2, biomass: 0 }, 
        desc: 'Cultiva tecidos orgânicos. Consome Vapor para evitar congelamento.'
    },
    'extrator': { 
        id: 'extrator', name: 'Extrator de Veias', 
        cost: { copper: 0, biomass: 80 }, 
        prod: { copper: 20, biomass: 0, steam: 0, pop: 0, defense: 0 }, 
        consume: { steam: 3, biomass: 5 }, 
        desc: 'Perfura o solo em busca de cobre corroído. Exige lubrificação orgânica.'
    },
    'caldeira': { 
        id: 'caldeira', name: 'Caldeira de Sangue', 
        cost: { copper: 120, biomass: 0 }, 
        prod: { steam: 25, biomass: 0, copper: 0, pop: 0, defense: 0 }, 
        consume: { biomass: 10, steam: 0 }, 
        desc: 'Incinera carne crua para gerar a pressão de Vapor necessária para a colónia.'
    },
    'casulo': { 
        id: 'casulo', name: 'Casulos de Gestação', 
        cost: { copper: 100, biomass: 100 }, 
        prod: { pop: 2, steam: 0, biomass: 0, copper: 0, defense: 0 }, 
        consume: { steam: 4, biomass: 5 }, 
        desc: 'Gera novos trabalhadores ciborgues. Alto consumo térmico.'
    },
    'torre_purga': { 
        id: 'torre_purga', name: 'Torre de Purgação (Defesa)', 
        cost: { copper: 250, biomass: 50 }, 
        prod: { defense: 10, steam: 0, biomass: 0, copper: 0, pop: 0 }, 
        consume: { steam: 5, biomass: 0 }, 
        desc: 'Essencial para sobreviver ao Dia 10. Dispara vapor superaquecido.'
    }
};

export class WorldMapManager {
    constructor() {
        this.globalDay = 1;
        this.activeCityId = 'setor_alfa';
        
        // O Mapa Global do seu Império
        this.sectors = {
            'setor_alfa': { id: 'setor_alfa', name: 'Núcleo Alfa', colonized: true, tempMod: 1.0, biomass: 300, copper: 200, steam: 100, population: 20, defense: 0, buildings: {} },
            'abisso_laton': { id: 'abisso_laton', name: 'Abismo de Latão', colonized: false, tempMod: 0.5, biomass: 50, copper: 600, steam: 100, population: 0, defense: 0, buildings: {} },
            'veia_ossea': { id: 'veia_ossea', name: 'Veia Óssea Viva', colonized: false, tempMod: 1.5, biomass: 800, copper: 40, steam: 100, population: 0, defense: 0, buildings: {} }
        };

        this.init();
    }

    init() {
        this.renderRadar();
        this.renderActiveCity();
        this.renderBuildMenu();
    }

    switchView(view) {
        document.getElementById('view-city').classList.toggle('hidden', view !== 'city');
        document.getElementById('view-map').classList.toggle('hidden', view !== 'map');
        
        document.getElementById('btn-view-city').className = view === 'city' ? 'panel px-6 py-2 border-amber-600 text-amber-500 font-bold text-xs bg-amber-950/20' : 'panel px-6 py-2 border-zinc-700 text-zinc-500 font-bold text-xs';
        document.getElementById('btn-view-map').className = view === 'map' ? 'panel px-6 py-2 border-amber-600 text-amber-500 font-bold text-xs bg-amber-950/20' : 'panel px-6 py-2 border-zinc-700 text-zinc-500 font-bold text-xs';
    }

    renderRadar() {
        const nodesContainer = document.getElementById('radar-nodes');
        if (!nodesContainer) return;
        nodesContainer.innerHTML = '';

        Object.values(this.sectors).forEach(sector => {
            const statusClass = sector.colonized ? 'radar-node-active border-amber-600 text-amber-500' : 'border-zinc-800 text-zinc-600 hover:border-zinc-500';
            nodesContainer.innerHTML += `
                <button onclick="window.World.inspectSector('${sector.id}')" class="panel p-4 flex flex-col items-center justify-center text-center transition-all ${statusClass}">
                    <span class="text-xs font-bold block">${sector.name}</span>
                    <span class="text-[9px] uppercase tracking-tighter opacity-60">${sector.colonized ? '🔗 Ativo' : '❌ Desabitado'}</span>
                </button>
            `;
        });
    }

    inspectSector(id) {
        const sector = this.sectors[id];
        const details = document.getElementById('sector-details');
        const actions = document.getElementById('sector-action-zone');

        details.innerHTML = `
            <h3 class="text-white font-bold uppercase text-sm">${sector.name}</h3>
            <p class="text-xs text-zinc-400">Multiplicador Térmico: <span class="text-orange-400">${sector.tempMod}x</span></p>
            <p class="text-xs text-zinc-400">Prospecção Geológica:</p>
            <ul class="text-[11px] text-zinc-500 list-disc list-inside pl-2">
                <li>Biomassa Nativa: ${sector.biomass}</li>
                <li>Cobre Subterrâneo: ${sector.copper}</li>
            </ul>
        `;

        if (sector.colonized) {
            actions.innerHTML = `<button onclick="window.World.selectCity('${sector.id}')" class="panel p-3 w-full border-amber-600 text-amber-500 font-bold text-xs uppercase hover:bg-amber-950/20">🔄 Conectar ao Painel Central</button>`;
        } else {
            actions.innerHTML = `<button onclick="window.World.colonizeSector('${sector.id}')" class="panel p-3 w-full border-emerald-800 text-emerald-600 font-bold text-xs uppercase hover:bg-emerald-950/20">🚀 Injetar Cápsula de Colonização (Custos: 200 Cobre)</button>`;
        }
    }

    colonizeSector(id) {
        const currentCity = this.sectors[this.activeCityId];
        const targetSector = this.sectors[id];

        if (currentCity.copper >= 200) {
            currentCity.copper -= 200;
            targetSector.colonized = true;
            targetSector.population = 10;
            targetSector.steam = 100;
            
            this.renderRadar();
            this.inspectSector(id);
            this.renderActiveCity();
            Events.emit('COMBAT_LOG', { text: `NOVO SETOR: Biosistema fundado em ${targetSector.name}.` });
        } else {
            Events.emit('COMBAT_LOG', { text: `ERRO DE LOGÍSTICA: Cobre insuficiente no núcleo ativo.` });
        }
    }

    selectCity(id) {
        this.activeCityId = id;
        document.getElementById('current-city-name').innerText = this.sectors[id].name.toUpperCase();
        this.renderActiveCity();
        this.renderBuildMenu();
        this.switchView('city');
    }

    renderActiveCity() {
        const city = this.sectors[this.activeCityId];
        
        // Atualiza UI de recursos
        document.getElementById('ui-biomass').innerText = city.biomass;
        document.getElementById('ui-copper').innerText = city.copper;
        document.getElementById('ui-pop').innerText = `${city.population}/${city.population}`;
        
        // Defesa
        const defenseUi = document.getElementById('ui-defense');
        if(defenseUi) defenseUi.innerText = city.defense;

        // Temperatura dinâmica visual
        const tempText = document.getElementById('txt-temp');
        const barTemp = document.getElementById('bar-temp');
        const calculatedTemp = Math.floor(city.steam * city.tempMod);
        
        tempText.innerText = `${calculatedTemp}°C`;
        barTemp.style.width = `${Math.min(100, city.steam)}%`;
        
        if (calculatedTemp < 30) {
            tempText.className = "text-red-600 font-bold animate-pulse";
            barTemp.className = "h-full bg-red-600 w-full transition-all";
        } else {
            tempText.className = "text-orange-500 font-bold";
            barTemp.className = "h-full bg-orange-600 w-full transition-all";
        }
    }

    renderBuildMenu() {
        const grid = document.getElementById('city-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const city = this.sectors[this.activeCityId];

        Object.values(BUILDING_CATALOG).forEach(b => {
            const count = city.buildings[b.id] || 0;
            const canAfford = city.copper >= b.cost.copper && city.biomass >= b.cost.biomass;
            
            grid.innerHTML += `
                <div class="panel p-3 border border-zinc-800 bg-black/40 flex flex-col justify-between">
                    <div>
                        <h3 class="text-white font-bold text-xs">${b.name} <span class="text-amber-500">(x${count})</span></h3>
                        <p class="text-[9px] text-zinc-500 mt-1 h-8">${b.desc}</p>
                    </div>
                    
                    <div class="mt-2 text-[10px] bg-black/50 p-1 border border-zinc-900">
                        <span class="text-emerald-600 block">Custo: ${b.cost.copper} 🔩 | ${b.cost.biomass} 🥩</span>
                        <span class="text-orange-600 block">Consome/Dia: ${b.consume.steam || 0} 💨 | ${b.consume.biomass || 0} 🥩</span>
                    </div>

                    <button onclick="window.World.buildStructure('${b.id}')" 
                        class="mt-2 p-1 text-xs w-full font-bold uppercase transition-all ${canAfford ? 'bg-amber-950/30 text-amber-500 border border-amber-800 hover:bg-amber-900' : 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed'}"
                        ${!canAfford ? 'disabled' : ''}>
                        Construir
                    </button>
                </div>
            `;
        });
    }

    buildStructure(buildingId) {
        const city = this.sectors[this.activeCityId];
        const b = BUILDING_CATALOG[buildingId];

        if (city.copper >= b.cost.copper && city.biomass >= b.cost.biomass) {
            city.copper -= b.cost.copper;
            city.biomass -= b.cost.biomass;
            
            city.buildings[buildingId] = (city.buildings[buildingId] || 0) + 1;
            
            Events.emit('COMBAT_LOG', { text: `[ PRODUÇÃO ] ${b.name} cultivada em ${city.name}.` });
            this.renderActiveCity();
            this.renderBuildMenu();
        }
    }

    advanceGlobalDay() {
        this.globalDay++;
        
        Object.values(this.sectors).forEach(city => {
            if (!city.colonized) return;
            
            let steamConsumption = Math.floor(5 * city.tempMod);
            let biomassConsumption = Math.floor(city.population * 0.3);

            // Calcula produção de edifícios
            Object.entries(city.buildings).forEach(([bId, count]) => {
                const bDef = BUILDING_CATALOG[bId];
                const neededSteam = bDef.consume.steam * count;
                const neededBiomass = bDef.consume.biomass * count;

                if (city.steam >= neededSteam && city.biomass >= neededBiomass) {
                    city.steam -= neededSteam;
                    city.biomass -= neededBiomass;
                    
                    city.biomass += bDef.prod.biomass * count;
                    city.copper += bDef.prod.copper * count;
                    city.steam += bDef.prod.steam * count;
                    city.population += bDef.prod.pop * count;
                    if(bDef.prod.defense) city.defense += bDef.prod.defense * count;
                }
            });

            city.steam -= steamConsumption;
            city.biomass -= biomassConsumption;

            // Penalidades
            if (city.steam < 0) {
                city.steam = 0;
                city.population -= 2;
                if (city.id === this.activeCityId) Events.emit('COMBAT_LOG', { text: `ALERTA TÉRMICO: Morte por congelamento em ${city.name}.` });
            }
            if (city.biomass < 0) {
                city.biomass = 0;
                city.population -= 1;
                if (city.id === this.activeCityId) Events.emit('COMBAT_LOG', { text: `FALÊNCIA ORGÂNICA: População definhando em ${city.name}.` });
            }
            if (city.population < 0) city.population = 0;
        });

        // Atualiza a Interface
        document.getElementById('day-counter').innerText = `DIA ${this.globalDay.toString().padStart(2, '0')}`;
        const daysLeft = 10 - (this.globalDay % 10 === 0 ? 10 : this.globalDay % 10);
        document.getElementById('days-left').innerText = daysLeft;
        
        this.renderActiveCity();
        this.renderBuildMenu();

        // Avisa os outros sistemas (como o CrisisSystem) que o dia passou
        Events.emit('DAY_ADVANCED', { day: this.globalDay, activeCity: this.sectors[this.activeCityId] });
    }
}