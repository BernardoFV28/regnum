class UIManager {
    constructor() {
        this.logContainer = document.getElementById('game-log');
        
        // Inscreve-se nos eventos do EventBus
        Events.on('PLAYER_UPDATED', (p) => this.updatePlayer(p));
        Events.on('ENEMY_SPAWNED', (e) => this.updateEnemy(e));
        Events.on('ENEMY_DAMAGED', (e) => this.updateEnemy(e));
        Events.on('COMBAT_LOG', (msg) => this.log(msg.text, msg.type));
        Events.on('SCREEN_SHAKE', (intensity) => this.shakeScreen(intensity));
        Events.on('SET_CONTROLS', (state) => this.toggleButtons(state));
    }

    updatePlayer(player) {
        const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        document.getElementById('hp-text').innerText = `${player.hp}/${player.maxHp}`;
        document.getElementById('heat-val').innerText = `${player.heat}%`;
        document.getElementById('mem-val').innerText = player.memories;
        document.getElementById('corr-val').innerText = `${player.corruption}%`;
    }

    updateEnemy(enemy) {
        const nameEl = document.getElementById('enemy-name');
        const sprite = document.getElementById('enemy-sprite');
        
        if (enemy.isDead) {
            nameEl.innerText = "[ AMEAÇA NEUTRALIZADA ]";
            sprite.innerHTML = "X";
        } else {
            nameEl.innerText = `${enemy.name} [${enemy.hp} HP]`;
            sprite.innerHTML = "!";
        }
    }

    log(text, type = 'normal') {
        const p = document.createElement('p');
        p.innerText = `> ${text}`;
        p.className = 'mb-2';
        
        if (type === 'critical') p.className += ' text-red-500 font-bold glitch-text';
        if (type === 'magic') p.className += ' text-blue-400 italic';
        if (type === 'system') p.className += ' text-orange-500 text-xs';
        
        this.logContainer.prepend(p);
        
        // Object Pooling: Mantém o log limpo (max 15 linhas)
        if (this.logContainer.children.length > 15) {
            this.logContainer.removeChild(this.logContainer.lastChild);
        }
    }

    shakeScreen(intensity) {
        const arena = document.getElementById('arena');
        const className = intensity === 'heavy' ? 'shake-heavy' : 'shake-light';
        arena.classList.add(className);
        setTimeout(() => arena.classList.remove(className), 200);
    }

    toggleButtons(isDisabled) {
        document.querySelectorAll('#action-bar button').forEach(btn => {
            btn.disabled = isDisabled;
        });
    }
}
// Substitua este bloco no seu UI.js
export class UIManager {
    constructor() {
        this.enemyImg = document.getElementById('enemy-sprite');
        this.arena = document.getElementById('arena');
        
        // Dicionário de ativos
        this.assets = {
            'player': 'woe6.png',
            'sentinela': 'woe5.png',
            'monstro2': 'woe4.png',
            'boss': 'woe3.png',
            'fundo': 'woe2.png',
            'sangue': 'woe1.png'
        };

        Events.on('ENEMY_CHANGED', (m) => this.renderEnemy(m));
        Events.on('COMBAT_IMPACT', () => this.showGoreEffect());
    }

    renderEnemy(monster) {
        // Aplica a imagem do inimigo
        this.enemyImg.src = `assets/${this.assets[monster.id]}`;
        // Aplica o fundo da arena
        this.arena.style.backgroundImage = `url('assets/${this.assets['fundo']}')`;
        this.arena.style.backgroundSize = 'cover';
    }

    showGoreEffect() {
        // Efeito visual quando acerta um golpe
        const fx = document.getElementById('impact-fx');
        fx.innerHTML = `<img src="assets/${this.assets['sangue']}" class="absolute w-full h-full opacity-50">`;
        setTimeout(() => fx.innerHTML = '', 300);
    }
}