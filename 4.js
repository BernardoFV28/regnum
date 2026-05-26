
class CombatFX {
    // Congela o tempo no momento do impacto (Hitstop)
    static async hitstop(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Aplica o tremor brutal na tela
    static applyImpact(isCritical = false) {
        const arena = document.getElementById('battle-field');
        if (isCritical) {
            document.body.classList.add('screen-shake-heavy');
            setTimeout(() => document.body.classList.remove('screen-shake-heavy'), 200);
        } else {
            arena.classList.add('shake-effect'); // Requer classe shake-effect no CSS
            setTimeout(() => arena.classList.remove('shake-effect'), 200);
        }
    }

    static log(message, type = 'normal') {
        const logPanel = document.getElementById('game-log');
        const p = document.createElement('p');
        p.innerText = message;
        
        if (type === 'critical') p.className = 'text-red-500 font-bold glitch-text';
        if (type === 'magic') p.className = 'text-blue-400 italic';
        if (type === 'system') p.className = 'text-orange-500 text-xs';
        
        logPanel.prepend(p);
    }
}

// --- 2. SISTEMA DE ENTIDADES E CORRUPÇÃO ---
class Entity {
    constructor(name, maxHp, str, def) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.str = str;
        this.def = def;
        this.isDead = false;
    }

    takeDamage(amount) {
        // Fórmula básica: Dano - 30% da Defesa
        let mitigation = Math.floor(this.def * 0.3);
        let finalDamage = Math.max(1, amount - mitigation);
        this.hp = Math.max(0, this.hp - finalDamage);
        if (this.hp === 0) this.isDead = true;
        return finalDamage;
    }
}

class Player extends Entity {
    constructor() {
        super("Eryon", 150, 25, 15);
        this.temperature = 0;       // Limite: 100%
        this.memories = 3;          // Recurso mágico
        this.corruption = 0;        // Limite: 100% (Finais/Mutações)
    }

    addHeat(amount) {
        this.temperature = Math.min(100, this.temperature + amount);
        if (this.temperature >= 100) {
            CombatFX.log("[ALERTA CRÍTICO] SUPERAQUECIMENTO. Dano interno recebido!", "critical");
            this.takeDamage(20); // Punição por superaquecer
            this.temperature = 50; // Resfria forçadamente após o dano
        }
    }

    addCorruption(amount) {
        this.corruption = Math.min(100, this.corruption + amount);
        if (this.corruption > 50 && this.corruption < 55) {
            CombatFX.log("[ANOMALIA] Raízes negras perfuram sua armadura. O metal chora.", "critical");
            document.body.style.setProperty('--copper-glow', '#8b0000'); // UI fica mais avermelhada
        }
    }
}

// --- 3. LOOP DE COMBATE E CONTROLE DE ESTADO ---
class GameManager {
    constructor() {
        this.player = new Player();
        this.enemy = new Entity("Drone Sentinela", 80, 12, 5);
        this.isPlayerTurn = true;
        this.initUI();
        this.bindEvents();
    }

    initUI() {
        this.updateUI();
        CombatFX.log("> Conexão neural estabelecida. Motores prontos.", "system");
    }

    updateUI() {
        // Barras e Status do Jogador
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        document.getElementById('hp-text').innerText = `${this.player.hp}/${this.player.maxHp} HP`;
        document.getElementById('temp-val').innerText = `${this.player.temperature}%`;
        document.getElementById('mem-val').innerText = this.player.memories;
        document.getElementById('corr-val').innerText = `${this.player.corruption}%`;

        // Status do Inimigo
        document.getElementById('enemy-name').innerText = this.enemy.isDead ? "DESTRUÍDO" : this.enemy.name;
    }

    bindEvents() {
        document.getElementById('btn-strike').onclick = () => this.executeAction('strike');
        document.getElementById('btn-magic').onclick = () => this.executeAction('magic');
        document.getElementById('btn-purge').onclick = () => this.executeAction('purge');
    }

    setButtonsState(disabled) {
        const btns = ['btn-strike', 'btn-magic', 'btn-purge'];
        btns.forEach(id => {
            const btn = document.getElementById(id);
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
            btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        });
    }

    async executeAction(type) {
        if (!this.isPlayerTurn || this.enemy.isDead) return;
        this.setButtonsState(true); // Bloqueia spam de cliques

        // Lógica da Ação do Jogador
        if (type === 'strike') {
            this.player.addHeat(20);
            await this.processAttack(this.player, this.enemy, this.player.str, false);
        } 
        else if (type === 'magic') {
            if (this.player.memories <= 0) {
                CombatFX.log("[ERRO] Sem memórias de cobre.", "system");
                this.setButtonsState(false);
                return;
            }
            this.player.memories -= 1;
            this.player.addCorruption(5); // Magia corrompe
            await this.processAttack(this.player, this.enemy, this.player.str * 2.5, true);
        }
        else if (type === 'purge') {
            this.player.temperature = 0;
            CombatFX.log("> Válvulas abertas. Vapor escaldante liberado.", "system");
            this.updateUI();
        }

        // Checa morte do inimigo
        if (this.enemy.isDead) {
            CombatFX.log(`[EXECUÇÃO] O núcleo de ${this.enemy.name} foi destroçado!`, "critical");
            document.getElementById('enemy-sprite').innerHTML = '<span class="text-red-900 text-4xl">X</span>';
            // Aqui entrará a lógica de gerar o próximo monstro no futuro
            return; 
        }

        // Turno do Inimigo
        if (type !== 'purge') {
            this.isPlayerTurn = false;
            setTimeout(async () => {
                await this.processAttack(this.enemy, this.player, this.enemy.str, false);
                this.isPlayerTurn = true;
                this.setButtonsState(false);
            }, 1000); // Delay de IA
        } else {
            this.setButtonsState(false);
        }
    }

    async processAttack(attacker, defender, baseDamage, isMagic) {
        // 1. Pré-impacto (Pausa para respirar)
        await CombatFX.hitstop(50); 
        
        // 2. Cálculo
        const dmg = defender.takeDamage(baseDamage);
        
        // 3. Impacto Brutal (Hitstop longo + Shake)
        const isCritical = dmg > 30;
        CombatFX.applyImpact(isCritical);
        await CombatFX.hitstop(isCritical ? 200 : 100); 

        // 4. Log e Atualização Visual
        CombatFX.log(`${attacker.name} causou ${dmg} de dano!`, isMagic ? 'magic' : 'normal');
        this.updateUI();
    }
}

// Inicia o Jogo apenas após a animação de boot do HTML terminar
setTimeout(() => {
    window.game = new GameManager();
}, 3000);