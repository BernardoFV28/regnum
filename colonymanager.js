class ColonyManager {
    constructor() {
        this.resources = { bio: 300, cop: 150, vap: 100 };
        this.day = 1;
        this.tickCounter = 0;
        
        this.catalog = [
            { id: 'cabana', name: 'ALOJAMENTO ÓSSEO', cost: 50, prod: 0, active: false },
            { id: 'fazenda', name: 'INCUBADORA CARNAL', cost: 100, prod: 5, active: true },
            { id: 'caldeira', name: 'NÚCLEO DE VAPOR', cost: 120, prod: 0, active: false },
            { id: 'muralha', name: 'PALIÇADA DE FERRO', cost: 80, prod: 0, active: false }
        ];

        this.init();
    }

    init() {
        window.WorldEngine.init();
        window.UIManager.init();
        window.CrisisSystem.init();
        
        this.updateAllUI();
        window.UIManager.addLog("Motor Imperial inicializado. Inverno estabilizado.", "info");

        // Loop Principal do Jogo (1 tick por segundo)
        setInterval(() => this.gameTick(), 1000);

        // Escutando penalidade do CrisisSystem
        window.addEventListener('CRISIS_PENALTY', () => {
            const loss = Math.floor(this.resources.bio * 0.3);
            this.resources.bio -= loss;
            window.UIManager.updateResource('bio', this.resources.bio, -loss);
        });
    }

    gameTick() {
        if (window.CrisisSystem.isInCrisis) return; // Pausa durante cutscenes/overlays

        this.tickCounter++;
        
        // Consumo Automático de Vapor
        let steamDelta = -2;
        // Produção das Fazendas Ativas
        let bioDelta = this.catalog.find(b => b.id === 'fazenda').active ? 5 : 0;

        // Atualiza Lógica
        this.resources.vap = Math.max(0, Math.min(100, this.resources.vap + steamDelta));
        this.resources.bio += bioDelta;

        // Atualiza UI Dinamicamente
        window.UIManager.updateResource('bio', this.resources.bio, bioDelta);
        window.UIManager.updateSteam(this.resources.vap);

        // Transição de Dia (A cada 10 segundos para efeito dramático)
        if (this.tickCounter >= 10) {
            this.tickCounter = 0;
            this.day++;
            document.getElementById('day-counter').innerText = `DIA ${this.day.toString().padStart(2, '0')}`;
            window.CrisisSystem.advanceDay();
            window.UIManager.addLog(`Ciclo ${this.day} iniciado. O frio castiga a carne.`, "info");
        }
    }

build(id, targetX = null, targetY = null) {
    const bldg = this.catalog.find(b => b.id === id);
    if (!bldg) return;

    if (this.resources.cop >= bldg.cost) {
        this.resources.cop -= bldg.cost;
        bldg.active = true;

        const gridX = targetX !== null ? targetX : Math.floor(this.placedBuildings.length * 1.5);
        const gridY = targetY !== null ? targetY : 10;

        window.WorldEngine.placedBuildings.push({ x: gridX, y: gridY, type: id });

        window.UIManager.updateResource('cop', this.resources.cop, -bldg.cost);
        window.UIManager.addLog(`Arquitetura ${bldg.name} enraizada nas coordenadas [${gridX}, ${gridY}].`, "info");
        this.updateAllUI();

        window.WorldEngine.setConstructionPreview(null);
    } else {
        window.UIManager.addLog("Cobre insuficiente para protocolo.", "warn");
    }
}

    updateAllUI() {
        window.UIManager.updateResource('bio', this.resources.bio, 0);
        window.UIManager.updateResource('cop', this.resources.cop, 0);
        window.UIManager.updateSteam(this.resources.vap);
        
        // Passa a função de build como callback para os cards do UIManager
        window.UIManager.renderBuildings(this.catalog, (id) => this.build(id));
    }
}

// Boot do Sistema
window.onload = () => {
    window.GameCore = new ColonyManager();
};
