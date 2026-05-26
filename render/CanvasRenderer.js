// render/CanvasRenderer.js

export class CanvasRenderer {
    constructor(ecsManager) {
        this.ecs = ecsManager;
        this.container = document.getElementById('game-container');
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Câmera (offset)
        this.camX = 0;
        this.camY = 0;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        // Limpa o frame anterior com o fundo escuro
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Busca entidades que têm posição para desenhar
        const entities = this.ecs.getEntitiesWith('Position');

        for (const id of entities) {
            const pos = this.ecs.getComponent(id, 'Position');
            
            // Desenha Cidadãos (Círculos Brancos)
            if (this.ecs.hasComponent(id, 'CitizenInfo')) {
                this.ctx.fillStyle = '#e0d8c0';
                this.ctx.beginPath();
                this.ctx.arc(pos.x - this.camX, pos.y - this.camY, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Desenha Árvores/Recursos (Quadrados Verdes)
            if (this.ecs.hasComponent(id, 'ResourceNode')) {
                const node = this.ecs.getComponent(id, 'ResourceNode');
                this.ctx.fillStyle = node.type === 'TREE' ? '#2e5c2e' : '#555';
                this.ctx.fillRect((pos.x - this.camX) - 10, (pos.y - this.camY) - 10, 20, 20);
            }

            // Desenha Construções (Retângulos Marrons)
            if (this.ecs.hasComponent(id, 'StorageBuilding')) {
                this.ctx.fillStyle = '#4a3320';
                this.ctx.fillRect((pos.x - this.camX) - 20, (pos.y - this.camY) - 20, 40, 40);
                this.ctx.strokeStyle = '#1a1a1a';
                this.ctx.strokeRect((pos.x - this.camX) - 20, (pos.y - this.camY) - 20, 40, 40);
            }
        }
    }
}