class combat {
    static async hitstop(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async processAttack(attacker, defender, baseDamage, type = 'physical') {
        // Pausa pré-impacto
        await this.hitstop(50);
        
        // Cálculo de Dano
        const mitigation = Math.floor(defender.def * 0.3);
        const finalDamage = Math.max(1, baseDamage - mitigation);
        defender.hp = Math.max(0, defender.hp - finalDamage);
        
        // Impacto Cinematográfico
        const isCritical = finalDamage >= (defender.maxHp * 0.2); // Se tirou 20% da vida de uma vez
        Events.emit('SCREEN_SHAKE', isCritical ? 'heavy' : 'light');
        
        // O "peso" do Hitstop
        await this.hitstop(isCritical ? 200 : 80);
        
        // Atualiza a UI e Log
        Events.emit('COMBAT_LOG', { 
            text: `${attacker.name} causou ${finalDamage} de dano!`, 
            type: type === 'magic' ? 'magic' : 'normal' 
        });
        
        if (attacker.id === 'player') {
            Events.emit('ENEMY_DAMAGED', defender);
        } else {
            Events.emit('PLAYER_UPDATED', defender);
        }

        // Checa Morte
        if (defender.hp <= 0) {
            defender.isDead = true;
            if (defender.id === 'player') {
                Events.emit('GAME_OVER', null);
            } else {
                Events.emit('COMBAT_LOG', { text: `[EXECUÇÃO] O núcleo de ${defender.name} foi estilhaçado.`, type: 'critical' });
                Events.emit('ENEMY_SLAIN', defender);
            }
        }
    }
}
export class combat {
    static async processAttack(attacker, defender) {
        Events.emit('SCREEN_SHAKE', 'heavy-shake');
       
        Events.emit('COMBAT_LOG', { text: `${attacker.name} ataca!` });
    }
}
import { lootsystem } from './lootsystem.js';

const lootGen = new lootsystem();

// Dentro do seu método que gerencia a vitória:
handleVictory(monster); {
    const item = lootGen.generateLoot(1); // Nível 1
    Events.emit('COMBAT_LOG', { 
        text: `VITÓRIA: Você extraiu um '${item.name}' (+${item.bonus} ATK).`, 
        type: 'critical' 
    });
    // O sistema agora processa o item como dados, não imagens.
}