export class DynamicBuildSystem {
    constructor(scene) {
        this.scene = scene;
        this.previewHologram = scene.add.sprite(0, 0, 'core_boiler').setAlpha(0.5);
        this.previewHologram.setBlendMode(Phaser.BlendModes.ADD); // Glow tecnológico
    }

    updatePlacement(pointer) {
        let worldX = pointer.worldX;
        let worldY = pointer.worldY;

        // Snapping Magnético Biomecânico
        // Procura estradas de carne ou tubos de vapor em um raio de 30px
        const snapNode = this.findNearestInfrastructureNode(worldX, worldY, 30);
        
        if (snapNode) {
            worldX = snapNode.x;
            worldY = snapNode.y;
            this.drawHologramCables(snapNode); // Feedback visual instantâneo de conexão
        }

        this.previewHologram.setPosition(worldX, worldY);

        // Validação Térmica e de Terreno AAA
        const tempAtLocation = this.scene.thermalGrid[this.getGridIndex(worldX, worldY)];
        if (tempAtLocation < -50) {
            this.previewHologram.setTint(0xff0000); // Área perigosa/inviável
        } else {
            this.previewHologram.setTint(0x00ffaa); // Válido
        }
    }

    placeStructure() {
        // Emissor de Partículas (Game Feel)
        const particles = this.scene.add.particles(this.previewHologram.x, this.previewHologram.y, 'steam_pipe', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1500,
            gravityY: -200 // O vapor sobe agressivamente
        });
        
        particles.explode(40);
        
        // Screen Shake Procedural para peso
        this.scene.cameras.main.shake(150, 0.005);
        
        // Consolida a estrutura no Pool e afeta a matriz térmica
        this.instantiateBuilding();
    }
}
