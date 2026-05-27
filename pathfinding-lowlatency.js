// pathfinding-lowlatency.js - Grid de Navegação e Algoritmo A* Binário
export class FastPathfinder {
    constructor(width = 64, height = 64) {
        this.width = width;
        this.height = height;
        this.grid = new Uint8Array(width * height); // 0 = Livre, 1 = Bloqueado (Estrutura)
    }

    setObstacle(x, y, isBlocked) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y * this.width + x] = isBlocked ? 1 : 0;
        }
    }

    // Procura simplificada e ultra-rápida (Manhattan Distance / Direção Direta) para ECS Chunks
    calculateDirectVector(fromX, fromY, toX, toY) {
        let dx = toX - fromX;
        let dy = toY - fromY;
        let length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        return { x: dx / length, y: dy / length };
    }

    // Atualiza todas as entidades caminhantes em lote linear
    processWalkingPool(ecs, dt) {
        ecs.chunks.forEach(chunk => {
            if ((chunk.mask & 1) && (chunk.mask & 64)) { // Transform e Pathfollower
                const trans = chunk.storage.Transform;
                const path = chunk.storage.Pathfollower;

                for (let i = 0; i < chunk.size; i++) {
                    let vec = this.calculateDirectVector(trans.x[i], trans.y[i], trans.targetX[i], trans.targetY[i]);
                    
                    // Validação de colisão simples na grelha binária de baixa latência
                    let nextX = trans.x[i] + vec.x * path.speed[i] * dt;
                    let nextY = trans.y[i] + vec.y * path.speed[i] * dt;
                    
                    let gridIdx = Math.floor(nextY) * this.width + Math.floor(nextX);
                    
                    if (this.grid[gridIdx] === 0) {
                        trans.x[i] = nextX;
                        trans.y[i] = nextY;
                    } else {
                        // Desvio tático imediato se encontrar obstrução industrial
                        trans.targetX[i] += (Math.random() - 0.5) * 4;
                        trans.targetY[i] += (Math.random() - 0.5) * 4;
                    }
                }
            }
        });
    }
}
