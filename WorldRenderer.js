// WorldRenderer.js

export class WorldRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Configuração da Grade (Tilemap)
        this.tileSize = 64; // Cada bloco do mapa terá 64x64 pixels
        this.gridWidth = 16;
        this.gridHeight = 12;

        // Banco de Imagens (Sem fallbacks)
        this.sprites = {};
        this.assetPaths = {
            house: 'assets/icons/house.png',
            farm: 'assets/icons/farm.png',
            wall: 'assets/icons/wall.png',
            incubadora: 'assets/icons/house.png', // Redirecionando para usar seus ícones disponíveis
            extrator: 'assets/icons/stone.png',
            caldeira: 'assets/icons/wood.png',
            casulo: 'assets/icons/food.png',
            muralha: 'assets/icons/wall.png',
            turbina: 'assets/icons/stone.png',
            sintetizador: 'assets/icons/farm.png'
        };

        // Matriz do Mundo: Guarda o que está em cada coordenada [x][y]
        this.worldMap = Array(this.gridWidth).fill(null).map(() => Array(this.gridHeight).fill(null));

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Carrega todas as texturas antes de iniciar o loop gráfico
        await this.preloadAssets();

        // Escuta o ColonyManager para saber quando posicionar uma nova estrutura no mapa 2D
        window.Events.on('STRUCTURE_BUILT', (data) => this.spawnBuildingOnMap(data.id));

        // Inicia o Loop de Renderização Principal (60 FPS)
        this.startLoop();
    }

    resizeCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        // Centraliza a grade no meio da tela se sobrar espaço
        this.offsetX = Math.floor((this.canvas.width - (this.gridWidth * this.tileSize)) / 2);
        this.offsetY = Math.floor((this.canvas.height - (this.gridHeight * this.tileSize)) / 2);
    }

    preloadAssets() {
        const promises = Object.entries(this.assetPaths).map(([key, path]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    this.sprites[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Aviso: Ativo solicitado não encontrado em: ${path}`);
                    resolve(); // Evita travar o jogo caso falte algum arquivo físico
                };
            });
        });
        return Promise.all(promises);
    }

    spawnBuildingOnMap(buildingId) {
        // Encontra o primeiro espaço vazio de forma procedural (do centro para as bordas)
        for (let y = 2; y < this.gridHeight - 2; y++) {
            for (let x = 2; x < this.gridWidth - 2; x++) {
                if (!this.worldMap[x][y]) {
                    this.worldMap[x][y] = buildingId;
                    return; // Posicionado com sucesso
                }
            }
        }
    }

    startLoop() {
        const render = () => {
            this.draw();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    draw() {
        // Limpa a tela com o preto profundo biopunk
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Desenha a Grade de Solo Industrial
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const posX = this.offsetX + (x * this.tileSize);
                const posY = this.offsetY + (y * this.tileSize);

                // Linhas da malha metálica
                this.ctx.strokeStyle = '#121212';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);

                // Pontos de ancoragem cibernéticos nos cruzamentos da grade
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(posX - 1, posY - 1, 3, 3);
            }
        }

        // 2. Desenha as Construções Ativas no Mapa
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                const buildingId = this.worldMap[x][y];
                if (buildingId && this.sprites[buildingId]) {
                    const posX = this.offsetX + (x * this.tileSize);
                    const posY = this.offsetY + (y * this.tileSize);

                    // Sombra projetada abaixo da estrutura para dar profundidade Top-View
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    this.ctx.fillRect(posX + 4, posY + 8, this.tileSize - 8, this.tileSize - 8);

                    // Renderiza o ícone real fornecido
                    this.ctx.drawImage(this.sprites[buildingId], posX + 4, posY + 4, this.tileSize - 8, this.tileSize - 8);

                    // Um indicador sutil de luz pulsante sob construções ativas
                    this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(posX + 2, posY + 2, this.tileSize - 4, this.tileSize - 4);
                }
            }
        }
    }
}
