// NarrativeSystem.js
export class NarrativeSystem {
    constructor() {
        this.active = false;
        this.events = [
            {
                id: 'coracao_pulsante',
                title: 'O CORAÇÃO SOB A ENGRENAGEM',
                desc: 'Escavadores encontraram uma massa de carne do tamanho de um tanque pulsando sob o setor 4. Cabos parecem se conectar a ela naturalmente.',
                choices: [
                    {
                        text: '[ PURGAR COM FOGO ]',
                        effectText: '-10 População | -50 Insanidade',
                        action: (city) => { city.population -= 10; city.insanity -= 50; }
                    },
                    {
                        text: '[ CONECTAR AO NÚCLEO ]',
                        effectText: '+100 Vapor | +30 Insanidade',
                        action: (city) => { city.steam += 100; city.insanity += 30; }
                    },
                    {
                        text: '[ ESTUDAR A ANATOMIA ]',
                        effectText: '+50 Biomassa | Risco de Infecção',
                        action: (city) => { city.biomass += 50; city.insanity += 15; }
                    }
                ]
            },
            {
                id: 'chuva_ferrugem',
                title: 'TEMPESTADE DE FERRUGEM',
                desc: 'Nuvens ácidas cobriram o céu. A chuva corrói o metal e a carne de forma indiscriminada. Precisamos nos abrigar.',
                choices: [
                    {
                        text: '[ SELAR AS PORTAS ]',
                        effectText: '-20 Cobre | Protege a População',
                        action: (city) => { city.copper -= 20; }
                    },
                    {
                        text: '[ FORÇAR TRABALHO ]',
                        effectText: '+40 Cobre | +40 Insanidade | -5 População',
                        action: (city) => { city.copper += 40; city.insanity += 40; city.population -= 5; }
                    }
                ]
            }
        ];

        window.Events.on('TRIGGER_NARRATIVE', () => this.fireRandomEvent());
    }

    fireRandomEvent() {
        if (this.active) return;
        this.active = true;
        
        const evt = this.events[Math.floor(Math.random() * this.events.length)];
        this.renderModal(evt);
    }

    renderModal(evt) {
        const modal = document.createElement('div');
        modal.id = 'narrative-modal';
        modal.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity';
        
        // Efeito visual de glitch e tremedeira
        window.Events.emit('SCREEN_SHAKE', { intensity: 'heavy' });
        window.Events.emit('CRT_GLITCH', true);

        let choicesHTML = '';
        evt.choices.forEach((choice, index) => {
            choicesHTML += `
                <button id="choice-${index}" class="w-full text-left p-4 border border-zinc-700 bg-zinc-900/50 hover:bg-amber-900/40 hover:border-amber-500 transition-all group">
                    <span class="block text-amber-500 font-bold tracking-widest text-sm group-hover:text-amber-400">${choice.text}</span>
                    <span class="block text-zinc-500 text-[10px] mt-1 font-mono">${choice.effectText}</span>
                </button>
            `;
        });

        modal.innerHTML = `
            <div class="panel border-2 border-red-900/50 max-w-lg w-full p-8 shadow-[0_0_50px_rgba(139,0,0,0.2)]">
                <h2 class="text-2xl text-red-600 font-black tracking-[0.3em] mb-4 border-b border-zinc-800 pb-4">${evt.title}</h2>
                <p class="text-zinc-300 text-sm leading-relaxed mb-8 font-medieval">${evt.desc}</p>
                <div class="flex flex-col gap-3">
                    ${choicesHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind das ações
        evt.choices.forEach((choice, index) => {
            document.getElementById(`choice-${index}`).addEventListener('click', () => {
                choice.action(window.Colony.resources);
                this.closeModal(evt.title);
            });
        });
    }

    closeModal(title) {
        document.getElementById('narrative-modal').remove();
        this.active = false;
        window.Events.emit('CRT_GLITCH', false);
        window.Events.emit('COMBAT_LOG', { text: `Decisão tomada: ${title}`, type: 'critical' });
        window.World.renderActiveCity();
    }
}
