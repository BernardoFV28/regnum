window.WorldEngine = {
    canvas: null,
    ctx: null,
    
    // Configurações da Câmera Cinemática
    cam: {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        zoom: 1.0, targetZoom: 1.0,
        minZoom: 0.5, maxZoom: 2.0,
        friction: 0.1,
        isDragging: false,
        startX: 0, startY: 0
    },

    // Configurações do Grid do Feudo
    grid: {
        cellSize: 64,
        width: 50,  // Mapa de 50x50 quadrantes
        height: 50,
        hoverCell: { x: -1, y: -1 }
    },

    placedBuildings: [], // Matriz de estruturas instanciadas no mundo
    particles: [],
    previewBuilding: null,

    init() {
        this.canvas = document.getElementById('ash-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupResizing();
        this.setupInput();
        this.generateEnvironmentParticles();
        
        // Centraliza a câmera no início do jogo
        this.cam.x = this.cam.targetX = (this.grid.width * this.grid.cellSize) / -4;
        this.cam.y = this.cam.targetY = (this.grid.height * this.grid.cellSize) / -4;

        // Inicia o Loop de Renderização de 60 FPS
        this.renderLoop();
    },

    setupResizing() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    },

    setupInput() {
        // Movimentação de Arraste da Câmera (Botão Direito ou Esquerdo sem construção)
        window.addEventListener('mousedown', (e) => {
            if (window.CrisisSystem.isInCrisis) return;
            
            // Se clicar na UI (painéis laterais), ignora o arraste
            if (e.target.closest('.panel') || e.target.closest('#top-bar')) return;

            this.cam.isDragging = true;
            this.cam.startX = e.clientX - this.cam.x;
            this.cam.startY = e.clientY - this.cam.y;
        });

        window.addEventListener('mousemove', (e) => {
            const worldCoords = this.screenToWorld(e.clientX, e.clientY);
            
            // Atualiza célula focada no Grid
            this.grid.hoverCell.x = Math.floor(worldCoords.x / this.grid.cellSize);
            this.grid.hoverCell.y = Math.floor(worldCoords.y / this.grid.cellSize);

            if (this.cam.isDragging) {
                this.cam.targetX = e.clientX - this.cam.startX;
                this.cam.targetY = e.clientY - this.cam.startY;
            }
        });

        window.addEventListener('mouseup', () => {
            this.cam.isDragging = false;
        });

        // Zoom Cinemático Suave (Roda do Mouse)
        window.addEventListener('wheel', (e) => {
            if (e.target.closest('.panel')) return; // Preserva scroll do log
            
            const zoomFactor = e.deltaY * -0.001;
            this.cam.targetZoom = Math.max(this.cam.minZoom, Math.min(this.cam.maxZoom, this.cam.targetZoom + zoomFactor));
        });

        // Clique para Construir Estrutura no Mundo
        window.addEventListener('click', (e) => {
            if (!this.previewBuilding || this.cam.isDragging) return;
            if (e.target.closest('.panel') || e.target.closest('#top-bar')) return;

            const hX = this.grid.hoverCell.x;
            const hY = this.grid.hoverCell.y;

            // Validação de Limites de Território Romano Decadente
            if (hX >= 0 && hX < this.grid.width && hY >= 0 && hY < this.grid.height) {
                const isOccupied = this.placedBuildings.some(b => b.x === hX && b.y === hY);
                
                if (!isOccupied) {
                    // Dispara ordem para o ColonyManager validar custos
                    window.GameCore.build(this.previewBuilding.id, hX, hY);
                } else {
                    window.UIManager.addLog("Terreno obstruído por detritos orgânicos.", "warn");
                }
            }
        });
    },

    generateEnvironmentParticles() {
        this.particles = [];
        for (let i = 0; i < 70; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                speedY: Math.random() * -1.5 - 0.5,
                speedX: Math.random() * 0.6 - 0.3,
                alpha: Math.random() * 0.4 + 0.1
            });
        }
    },

    setConstructionPreview(buildingId) {
        if (!buildingId) {
            this.previewBuilding = null;
            return;
        }
        const catalogItem = window.GameCore.catalog.find(b => b.id === buildingId);
        this.previewBuilding = catalogItem ? { id: buildingId, name: catalogItem.name } : null;
    },

    screenToWorld(sX, sY) {
        return {
            x: (sX - window.innerWidth / 2 - this.cam.x) / this.cam.zoom,
            y: (sY - window.innerHeight / 2 - this.cam.y) / this.cam.zoom
        };
    },

    renderLoop() {
        // Interpolação Linear (LERP) para Suavização AAA da Câmera
        this.cam.x += (this.cam.targetX - this.cam.x) * this.cam.friction;
        this.cam.y += (this.cam.targetY - this.cam.y) * this.cam.friction;
        this.cam.zoom += (this.cam.targetZoom - this.cam.zoom) * this.cam.friction;

        this.render();
        requestAnimationFrame(() => this.renderLoop());
    },

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#020202'; // Preto Orgânico
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        // Aplica transformações cinemáticas baseadas no centro da tela
        ctx.translate(w / 2 + this.cam.x, h / 2 + this.cam.y);
        ctx.scale(this.cam.zoom, this.cam.zoom);

        // 1. DESENHO DO GRID PROCEDURAL IMPERIAL
        ctx.strokeStyle = '#2a2318'; // Metal enferrujado sutil
        ctx.lineWidth = 0.5;
        const maxW = this.grid.width * this.grid.cellSize;
        const maxH = this.grid.height * this.grid.cellSize;

        for (let i = 0; i <= this.grid.width; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.grid.cellSize, 0);
            ctx.lineTo(i * this.grid.cellSize, maxH);
            ctx.stroke();
        }
        for (let j = 0; j <= this.grid.height; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * this.grid.cellSize);
            ctx.lineTo(maxW, j * this.grid.cellSize);
            ctx.stroke();
        }

        // 2. RENDERIZAÇÃO DOS EDIFÍCIOS CONSTRUÍDOS
        this.placedBuildings.forEach(b => {
            const bX = b.x * this.grid.cellSize;
            const bY = b.y * this.grid.cellSize;
            const pad = 8;

            // Corpo da estrutura de metal forjado
            ctx.fillStyle = '#111111';
            ctx.fillRect(bX + pad, bY + pad, this.grid.cellSize - pad*2, this.grid.cellSize - pad*2);
            ctx.strokeStyle = '#3d3020';
            ctx.lineWidth = 2;
            ctx.strokeRect(bX + pad, bY + pad, this.grid.cellSize - pad*2, this.grid.cellSize - pad*2);

            // Núcleo energético (flesh pulse / steam)
            ctx.fillStyle = b.type === 'fazenda' ? '#1a3d1a' : '#7a4a00';
            ctx.fillRect(bX + pad*2, bY + pad*2, this.grid.cellSize - pad*4, this.grid.cellSize - pad*4);
        });

        // 3. HOLOGRAMA DE POSICIONAMENTO (PREVIEW)
        if (this.previewBuilding) {
            const hX = this.grid.hoverCell.x;
            const hY = this.grid.hoverCell.y;

            if (hX >= 0 && hX < this.grid.width && hY >= 0 && hY < this.grid.height) {
                const isOccupied = this.placedBuildings.some(b => b.x === hX && b.y === hY);
                
                // Holograma: Verde Válido / Vermelho Sangue Inválido
                ctx.fillStyle = isOccupied ? 'rgba(107, 21, 21, 0.4)' : 'rgba(26, 61, 26, 0.4)';
                ctx.strokeStyle = isOccupied ? '#8b0000' : '#2d5c1a';
                ctx.lineWidth = 2;

                ctx.fillRect(hX * this.grid.cellSize, hY * this.grid.cellSize, this.grid.cellSize, this.grid.cellSize);
                ctx.strokeRect(hX * this.grid.cellSize, hY * this.grid.cellSize, this.grid.cellSize, this.grid.cellSize);
            }
        }

        ctx.restore();

        // 4. CAMADA ATMOSFÉRICA DE CINZAS E TEMPESTADE
        ctx.fillStyle = 'rgba(138, 108, 42, 0.2)';
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) {
                p.y = h;
                p.x = Math.random() * w;
            }
        });

        // 5. MINIMAPA MILITAR INTEGRADO (Canto Inferior Esquerdo da tela)
        this.renderMinimap(w, h);
    },

    renderMinimap(w, h) {
        const miniSize = 140;
        const margin = 35;
        const mX = margin;
        const mY = h - miniSize - margin;

        const ctx = this.ctx;

        // Moldura do radar
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(mX, mY, miniSize, miniSize);
        ctx.strokeStyle = '#2a2318';
        ctx.lineWidth = 3;
        ctx.strokeRect(mX, mY, miniSize, miniSize);

        // Pontos de estruturas na malha militar
        ctx.fillStyle = '#c49a2e';
        const ratio = miniSize / (this.grid.width * this.grid.cellSize);
        
        this.placedBuildings.forEach(b => {
            const pX = mX + (b.x * this.grid.cellSize) * ratio;
            const pY = mY + (b.y * this.grid.cellSize) * ratio;
            ctx.fillRect(pX, pY, 4, 4);
        });

        // Varredura de Scan do Radar
        const scanY = mY + ((Date.now() % 3000) / 3000) * miniSize;
        ctx.strokeStyle = 'rgba(196, 154, 46, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mX, scanY);
        ctx.lineTo(mX + miniSize, scanY);
        ctx.stroke();
    }
};
