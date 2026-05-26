import { EventBus } from './eventbus.js';
import { UIManager } from './2.js';
import { CombatEngine } from './3.js';
import { WorldManager } from './1.js';
import { LootSystem } from './lootsystem.js'; // Novo sistema de loot

// Instanciação dos Módulos
const ui = new UIManager();
const world = new WorldManager();
const lootGen = new LootSystem();

window.onload = () => {
    console.log("War of Eryon: Sistema Iniciado.");
    world.spawnMonster({ id: 'sentinela', name: 'Drone Sentinela' });
};

// Orchestrador de Ações
window.executeAction = (action) => {
    // 1. Processa Ação (Golpe, Magia, etc)
    CombatEngine.processAttack(world.currentMonster, action);
    
    // 2. Verifica se o inimigo foi derrotado
    if (world.currentMonster.hp <= 0) {
        handleVictory();
    }
};

function handleVictory() {
    // Gera loot proceduralmente (sem imagens!)
    const item = lootGen.generateLoot(world.roomNumber);
    
    // Dispara eventos para o sistema
    Events.emit('COMBAT_LOG', { 
        text: `VITÓRIA: Você escavou um '${item.name}' nos escombros.`, 
        type: 'critical' 
    });
    
    // Se quiser aplicar o item automaticamente ao jogador:
    // player.applyItem(item);
    
    // Spawna próximo inimigo após breve delay
    setTimeout(() => {
        world.roomNumber++;
        world.spawnMonster({ id: 'monstro2', name: 'Massa de Carne' });
    }, 3000);
}
import { ColonyManager } from './ColonyManager.js';

// Inicializa a simulação urbana
const colony = new ColonyManager();

window.Colony = colony;
import { EventBus } from './EventBus.js';
import { WorldMapManager } from './WorldMap.js';
import { CrisisSystem } from './CrisisSystem.js';

console.log("=== SISTEMA OPERACIONAL ERYON // KERNEL INICIADO ===");

// 1. Inicializa o Sistema Nervoso
// (O EventBus já é instanciado dentro do seu próprio arquivo e jogado no window.Events)

// 2. Inicializa o Motor de Crise e Invasões
const crisis = new CrisisSystem();

// 3. Inicializa a Gestão de Cidades (O coração do gameplay)
const worldMap = new WorldMapManager();
window.World = worldMap;

// 4. Conexão do Log ao HTML
Events.on('COMBAT_LOG', (logData) => {
    const logBox = document.getElementById('colony-log');
    if (!logBox) return;
    
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const logEntry = document.createElement('p');
    
    logEntry.className = "text-zinc-400 border-l-2 border-amber-900 pl-2 mb-1 opacity-0 transition-opacity duration-500";
    logEntry.innerHTML = `<span class="text-zinc-600">[${time}]</span> ${logData.text}`;
    
    logBox.prepend(logEntry);
    
    // Fade-in effect procedural
    requestAnimationFrame(() => {
        logEntry.classList.remove('opacity-0');
    });
});
