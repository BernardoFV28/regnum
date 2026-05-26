export class MapGenerator {
    constructor(buildingFactory) {
        this.factory = buildingFactory;
    }

    generateChunk(startX, startY, width, height) {
        for (let x = startX; x < startX + width; x++) {
            for (let y = startY; y < startY + height; y++) {
                const noise = Math.random(); // Em produção: usar SimplexNoise
                if (noise > 0.85) {
                    this.factory.createResourceNode('TREE', x, y, 50); // 50 de madeira
                } else if (noise < 0.05) {
                    this.factory.createResourceNode('STONE_VEIN', x, y, 200);
                }
            }
        }
    }
}