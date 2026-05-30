window.CrisisSystem = {
    daysToInvasion: 5,
    isInCrisis: false,

    init() {
        this.updateWarningUI();
    },

    advanceDay() {
        if (this.isInCrisis) return;
        this.daysToInvasion--;
        this.updateWarningUI();

        if (this.daysToInvasion <= 0) {
            this.triggerInvasion();
        } else if (this.daysToInvasion <= 2) {
            window.UIManager.addLog("Movimentação detectada nos túneis inferiores...", "warn");
        }
    },

    updateWarningUI() {
        const warnEl = document.getElementById('invasion-warning');
        document.getElementById('days-to-invasion').innerText = this.daysToInvasion;
        
        if (this.daysToInvasion <= 1) warnEl.classList.add('warning-pulse');
        else warnEl.classList.remove('warning-pulse');
    },

    triggerInvasion() {
        this.isInCrisis = true;
        const overlay = document.getElementById('crisis-overlay');
        overlay.classList.remove('hidden');
        
        // Audio Synthesis (Web Audio API) para Alarme
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 1);

        const txtEl = document.getElementById('crisis-typewriter');
        const text = "A CARNE ASCENDIDA ROMPEU AS MURALHAS DO SETOR LESTE.";
        txtEl.innerText = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            txtEl.innerText += text.charAt(i);
            i++;
            if (i >= text.length) clearInterval(typeInterval);
        }, 50);

        // Timer Militar
        let timeRemaining = 5;
        const timerEl = document.getElementById('crisis-timer');
        const countdown = setInterval(() => {
            timerEl.innerText = `00:00:0${timeRemaining}`;
            timeRemaining--;
            if (timeRemaining < 0) {
                clearInterval(countdown);
                this.resolveInvasion();
            }
        }, 1000);
    },

    resolveInvasion() {
        document.getElementById('crisis-overlay').classList.add('hidden');
        this.isInCrisis = false;
        this.daysToInvasion = 5 + Math.floor(Math.random() * 3); // Procedural
        this.updateWarningUI();
        window.UIManager.addLog("Ataque repelido. Baixas imensuráveis.", "crit");
        // Penalidade ao jogador disparada via evento global (capturado no ColonyManager)
        window.dispatchEvent(new CustomEvent('CRISIS_PENALTY'));
    }
};
