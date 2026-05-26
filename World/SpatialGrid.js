export class SpatialGrid {
    constructor(cellSize = 50) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    _getKey(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(entityId, x, y, tags = []) {
        const key = this._getKey(x, y);
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push({ id: entityId, x, y, tags });
    }

    findNearest(x, y, requiredTag) {
        const key = this._getKey(x, y);
        const cell = this.cells.get(key);
        if (!cell) return null; // Simplificado: em uma engine real, checaria células vizinhas

        let nearest = null;
        let minF = Infinity;

        for (const item of cell) {
            if (item.tags.includes(requiredTag)) {
                const dist = (item.x - x) ** 2 + (item.y - y) ** 2; // Distância ao quadrado para otimização
                if (dist < minF) {
                    minF = dist;
                    nearest = item.id;
                }
            }
        }
        return nearest;
    }
}