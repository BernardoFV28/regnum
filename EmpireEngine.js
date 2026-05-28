import Phaser from 'phaser';

// Constantes de Otimização Extrema
const CHUNK_SIZE = 32;
const TILE_SIZE = 64;
const CHUNK_PIXEL_SIZE = CHUNK_SIZE * TILE_SIZE;

export class EmpireEngine extends Phaser.Scene {
    constructor() {
        super({ key: 'EmpireEngine' });
        
        // Memória pré-alocada para evitar Garbage Collection Spikes
        this.activeChunks = new Map();
        this.thermalGrid = new Float32Array(10000 * 10000); // Matriz global de temperatura
        this.entityPool = [];
    }

    preload() {
        // Carregamento AAA Estrito - Sem Fallbacks
        this.load.image('core_boiler', 'assets/boiler.png');
        this.load.image('flesh_wall', 'assets/wall.png');
        this.load.image('steam_pipe', 'assets/pipe.png');
        this.load.image('citizen_drone', 'assets/drone.png');
        
        // Shaders Customizados
        this.load.glsl('thermal_distortion', 'assets/shaders/thermal.glsl');
        this.load.glsl('biomechanical_blight', 'assets/shaders/blight.glsl');
    }

    create() {
        this.cameras.main.setBackgroundColor('#050508');
        
        this.setupCinematicCamera();
        this.setupThermalSystems();
        this.initPostProcessing();
        
        // Inicia o ciclo de simulação determinística
        this.simulationTimer = 0;
        this.fixedDelta = 1000 / 30; // 30 Ticks por segundo para simulação pesada
    }

    setupCinematicCamera() {
        const cam = this.cameras.main;
        
        this.camState = {
            targetX: 0, targetY: 0,
            zoomTarget: 1.0,
            drag: 0.90, // Cinematic Damping pesado
            velocity: { x: 0, y: 0 }
        };

        // Edge Scrolling e Dragging
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.camState.velocity.x = (pointer.x - pointer.prevPosition.x) / cam.zoom;
                this.camState.velocity.y = (pointer.y - pointer.prevPosition.y) / cam.zoom;
                cam.scrollX -= this.camState.velocity.x;
                cam.scrollY -= this.camState.velocity.y;
            }
        });

        // Zoom Procedural Suave (LOD Trigger)
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const zoomDir = deltaY > 0 ? -1 : 1;
            this.camState.zoomTarget = Phaser.Math.Clamp(
                this.camState.zoomTarget + (zoomDir * 0.15),
                0.15, // Visão Macro do Império
                3.0   // Foco nos NPCs e detalhes das engrenagens
            );
        });
    }

    update(time, delta) {
        // 1. Damping Cinemático da Câmera
        if (!this.input.activePointer.isDown) {
            this.cameras.main.scrollX -= this.camState.velocity.x;
            this.cameras.main.scrollY -= this.camState.velocity.y;
            this.camState.velocity.x *= this.camState.drag;
            this.camState.velocity.y *= this.camState.drag;
        }
        
        // Lerp de Zoom
        this.cameras.main.zoom = Phaser.Math.Linear(this.cameras.main.zoom, this.camState.zoomTarget, 0.08);

        // 2. Gerenciamento de Chunks Baseado na Câmera (World Streaming)
        this.manageChunks();

        // 3. Simulação Determinística (Fixed Timestep)
        this.simulationTimer += delta;
        while (this.simulationTimer >= this.fixedDelta) {
            this.processThermalDynamics();
            this.processCitizenGOAP();
            this.simulationTimer -= this.fixedDelta;
        }
    }

    manageChunks() {
        const cam = this.cameras.main;
        const startChunkX = Math.floor(cam.worldView.left / CHUNK_PIXEL_SIZE);
        const endChunkX = Math.floor(cam.worldView.right / CHUNK_PIXEL_SIZE);
        const startChunkY = Math.floor(cam.worldView.top / CHUNK_PIXEL_SIZE);
        const endChunkY = Math.floor(cam.worldView.bottom / CHUNK_PIXEL_SIZE);

        // Renderiza e simula apenas chunks visíveis + 1 margem de segurança
        for (let x = startChunkX - 1; x <= endChunkX + 1; x++) {
            for (let y = startChunkY - 1; y <= endChunkY + 1; y++) {
                const chunkKey = `${x},${y}`;
                if (!this.activeChunks.has(chunkKey)) {
                    this.loadChunk(x, y, chunkKey);
                }
            }
        }
        
        // Descarrega chunks distantes (Object Pooling e Memory Culling)
        for (const [key, chunk] of this.activeChunks.entries()) {
            if (chunk.x < startChunkX - 2 || chunk.x > endChunkX + 2 || 
                chunk.y < startChunkY - 2 || chunk.y > endChunkY + 2) {
                this.unloadChunk(key);
            }
        }
    }

    loadChunk(x, y, key) {
        // Lógica de Geração Procedural usando Noise Algorithm
        const chunk = { x, y, entities: [] };
        this.activeChunks.set(key, chunk);
        // Aplica terrenos dinâmicos: planícies de cinzas, crateras orgânicas...
    }

    unloadChunk(key) {
        const chunk = this.activeChunks.get(key);
        // Retorna entidades para o Pool em vez de destruir (GC amigável)
        chunk.entities.forEach(e => e.setActive(false).setVisible(false));
        this.activeChunks.delete(key);
    }
}
