class worldmanager {
    constructor(player) {
        this.player = player;
        this.roomNumber = 1;
        this.currentEnemy = null;
        
        // Listeners
        Events.on('ENEMY_SLAIN', () => this.handleEnemyDeath());
    }

   // Dentro do seu World.js, ao definir os monstros:
spawnEnemy(type) {
    const monsters = {
        'sentinela': { id: 'sentinela', name: 'Drone Sentinela' },
        'monstro2': { id: 'monstro2', name: 'Massa de Carne' },
        'boss': { id: 'boss', name: 'Cardeal Biomecânico' }
    };
    
    this.currentMonster = monsters[type];
    Events.emit('ENEMY_CHANGED', this.currentMonster);

        
        // Boss na sala 3
        if (this.roomNumber === 3) {
            this.currentEnemy = { id: 'boss', name: 'CARDEAL BIOMECÂNICO', maxHp: 300, hp: 300, str: 25, def: 15, isDead: false };
            Events.emit('COMBAT_LOG', { text: 'Uma presença divina e corrompida aproxima-se...', type: 'critical' });
        } else {
            this.currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        }
        
        Events.emit('ENEMY_SPAWNED', this.currentEnemy);
        Events.emit('COMBAT_LOG', { text: `[ÁREA ${this.roomNumber}] Ameaça detectada: ${this.currentEnemy.name}`, type: 'system' });
    }

    handleEnemyDeath() {
        if (this.currentEnemy.id === 'boss') {
            Events.emit('COMBAT_LOG', { text: 'O SANGUE DE DEUS ESCORRE NAS ENGRENAGENS. VOCÊ VENCEU.', type: 'critical' });
            return; // Fim da demo
        }
        
        this.roomNumber++;
        setTimeout(() => this.spawnEnemy(), 2000); // 2 segundos respirando até a próxima sala
    }

    async processTurn(playerAction) {
        if (this.player.isDead || !this.currentEnemy || this.currentEnemy.isDead) return;
        Events.emit('SET_CONTROLS', true); // Bloqueia botões

        // 1. Ação do Jogador
        await playerAction();
        
        // 2. Ação do Inimigo (se não tiver morrido)
        if (!this.currentEnemy.isDead) {
            setTimeout(async () => {
                Events.emit('COMBAT_LOG', { text: `${this.currentEnemy.name} contra-ataca!` });
                await CombatEngine.processAttack(this.currentEnemy, this.player, this.currentEnemy.str, 'physical');
                
                if (!this.player.isDead) Events.emit('SET_CONTROLS', false); // Libera botões
            }, 1000); // IA "Pensa" por 1 segundo
        }
    }
}
