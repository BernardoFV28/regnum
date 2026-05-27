// ai-director.js - Diretor de Inteligência Artificial Biopunk AAA
export class BiopunkAIDirector {
    constructor() {
        this.aggressionScale = 1.0;
        this.tacticalAnalysisTimer = 0;
    }

    evaluateColonyWeakness(globalState) {
        let weaknessScore = 0;
        
        if (globalState.steamPressure < 40) weaknessScore += 30;
        if (globalState.resources.biomass < 100) weaknessScore += 25;
        if (globalState.collectiveFear > 60) weaknessScore += 20;
        
        return weaknessScore;
    }

    executeTacticalTick(ecs, globalState, dt) {
        this.tacticalAnalysisTimer += dt;
        
        // Avaliação tática a cada 5 segundos de simulação limpa
        if (this.tacticalAnalysisTimer >= 5.0) {
            this.tacticalAnalysisTimer = 0;
            const currentWeakness = this.evaluateColonyWeakness(globalState);
            
            if (currentWeakness > 50 && Math.random() < 0.4) {
                this.deployInfectionSpike(ecs, globalState);
            }
        }
    }

    deployInfectionSpike(ecs, globalState) {
        this.aggressionScale += 0.15;
        globalState.collectiveFear = Math.min(100, globalState.collectiveFear + 15);
        
        // Escolhe um vetor de infeção no ECS e força uma explosão de esporos
        window.Events.emit('HUD_FLASH', { 
            text: "SABOTAGEM BIOLÓGICA: Infiltrados libertaram toxinas nos reservatórios.", 
            color: '#a300ff' 
        });
    }

    spawnHordeWave(ecs, count, gridWidth, gridHeight) {
        // Injeta entidades agressoras diretamente nas fronteiras externas do mapa
        for (let i = 0; i < count; i++) {
            let edge = Math.floor(Math.random() * 4);
            let rx = 0, ry = 0;
            
            if (edge === 0) { rx = Math.random() * gridWidth; ry = 0; }
            else if (edge === 1) { rx = gridWidth; ry = Math.random() * gridHeight; }
            else if (edge === 2) { rx = Math.random() * gridWidth; ry = gridHeight; }
            else { rx = 0; ry = Math.random() * gridHeight; }

            // Criação imediata no buffer do ECS com máscara de combate e perseguição
            // ComponentMask: Transform (1) | Renderable (2) | Pathfollower (64) | InfectionVector (32)
            ecs.createEntity(1 | 2 | 32 | 64, {
                Transform: { x: rx, y: ry, targetX: gridWidth / 2, targetY: gridHeight / 2 },
                Renderable: { spriteId: 9, frame: 0, pulseOffset: Math.random(), opacity: 1.0 },
                Pathfollower: { speed: 2.5, progress: 0, currentNode: 0 },
                InfectionVector: { rotLevel: 40, sporeEmission: 5, necrosis: 10 }
            });
        }
    }
}
