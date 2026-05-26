// ui/UIManager.js

export class UIManager {
    constructor(eventBus) {
        this.events = eventBus;
        
        // Elementos do Top Bar
        this.elFood = document.getElementById('res-food');
        this.elWood = document.getElementById('res-wood');
        this.elStone = document.getElementById('res-stone');
        this.elSeason = document.getElementById('time-season');
        this.elDay = document.getElementById('time-day');

        // Elementos do Inspetor
        this.elInspector = document.getElementById('entity-inspector');
        this.elInspName = document.getElementById('inspector-name');
        this.elInspRole = document.getElementById('inspector-role');
        this.elBarHunger = document.getElementById('bar-hunger');
        this.elBarWarmth = document.getElementById('bar-warmth');
        this.elInspTask = document.getElementById('inspector-task');

        this.setupListeners();
        this.setupButtons();
    }

    setupListeners() {
        // Atualiza relógio
        this.events.on('NEW_DAY', (data) => {
            this.elDay.innerText = `Dia ${data.day} - 08:00`;
            this.elSeason.innerText = data.season;
        });

        // Eventos Globais de UI
        this.events.on('CRISIS_ALERT', (data) => alert(`[ALERTA] ${data.text}`));
        this.events.on('CITIZEN_DIED', (data) => console.log(`O luto atinge o feudo. ${data.name} morreu de ${data.cause}.`));

        // Inspecionar Entidade
        this.events.on('ENTITY_SELECTED', (data) => {
            if (!data.info) {
                this.elInspector.classList.add('hidden');
                return;
            }
            this.elInspector.classList.remove('hidden');
            this.elInspName.innerText = data.info.name;
            this.elInspRole.innerText = data.info.profession;
            
            if (data.needs) {
                this.elBarHunger.style.width = `${data.needs.hunger}%`;
                this.elBarWarmth.style.width = `${data.needs.warmth}%`;
            }
            
            this.elInspTask.innerText = data.task ? data.task.type : "Ocioso";
        });
    }

    setupButtons() {
        // Menu de Construção
        const buttons = document.querySelectorAll('.build-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingType = btn.getAttribute('data-building');
                this.events.emit('ENTER_BUILD_MODE', { type: buildingType });
            });
        });
    }
}