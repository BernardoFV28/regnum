// RenderSystem.js - Pipeline Estrita de Renderização e Efeitos Especiais

import { ComponentRegistry } from './EngineCore.js';

export class CinematicRenderSystem {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.tileSize = 64;
        this.cameraOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.glitchActive = false;
        this.pulseTime = 0;

        this.sprites = {};
        this.assetPaths = {
            incubadora: 'assets/icons/house.png',
            extrator: 'assets/icons/stone.png',
            caldeira: 'assets/icons/wood.png',
            casulo: 'assets/icons/food.png',
            muralha: 'assets/icons/wall.png'
        };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Carregamento estrito (sem fallbacks automáticos, dispara aviso se faltar)
        Object.entries(this.assetPaths).forEach(([key, path]) => {
            const img = new Image();
            img.src = path;
            img.onload = () => { this.sprites[key] = img; };
            img.onerror = () => console.error(`[CRÍTICO] Ativo ausente na pipeline de renderização: ${path}`);
        });

        // Eventos de Impacto Visual (Game Feel)
        window.Events.on('SCREEN_SHAKE', (data) => {
            this.shakeIntensity = data.intensity === 'heavy' ? 24 : 8;
        });
        window.Events.on('CRT_GLITCH', (active) => {
            this.glitchActive = active;
        });
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    render(ecs, alpha, globalState) {
        this.pulseTime += 0.05;

        // Processamento de Vetor de Tremor Procedural (Damping Linear)
        let currentShakeX = 0;
        let currentShakeY = 0;
        if (this.shakeIntensity > 0) {
            currentShakeX = (Math.random() - 0.5) * this.shakeIntensity;
            currentShakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9; // Amortecimento progressivo
            if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
        }

        const ctx = this.ctx;
        
        // Fundo Industrial Escuro (Profundidade de Vazio)
        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(currentShakeX, currentShakeY);

        // Renderização da Malha Metálica do Setor
        ctx.strokeStyle = '#0f0f0f';
        ctx.lineWidth = 1;
        const gridCols = 20;
        const gridRows = 15;

        for (let x = 0; x < gridCols; x++) {
            for (let y = 0; y < gridRows; y++) {
                const posX = x * this.tileSize;
                const posY = y * this.tileSize;
                ctx.strokeRect(posX, posY, this.tileSize, this.tileSize);
                
                // Nós industriais nos cantos das grades
                ctx.fillStyle = '#1a1313';
                ctx.fillRect(posX - 1, posY - 1, 3, 3);
            }
        }

        // Iteração e Desenho dos Edifícios através de Máscara de Componentes
        const renderMask = ComponentRegistry.IDs.Transform | ComponentRegistry.IDs.Renderable;
        for (const [mask, archetype] of ecs.archetypes.entries()) {
            if ((mask & renderMask) !== renderMask) continue;

            const transformData = archetype.storage.get('Transform');
            const renderData = archetype.storage.get('Renderable');

            for (let i = 0; i < archetype.entityIds.length; i++) {
                const trans = transformData[i];
                const renderable = renderData[i];

                const drawX = trans.x * this.tileSize;
                const drawY = trans.y * this.tileSize;

                // Modulação orgânica escalar (Efeito de Pulsação de Carne Biomecânica)
                const pulseScale = 1 + (Math.sin(this.pulseTime + trans.x) * 0.03);
                const sizeOffset = (this.tileSize * (pulseScale - 1)) / 2;

                ctx.save();
                ctx.translate(drawX + this.tileSize / 2, drawY + this.tileSize / 2);
                ctx.scale(pulseScale, pulseScale);

                // Sombra de Projeção Orgânica Estritamente Acoplada
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                ctx.fillRect(-this.tileSize / 2 + 4, -this.tileSize / 2 + 6, this.tileSize - 8, this.tileSize - 4);

                const asset = this.sprites[renderable.spriteKey];
                if (asset) {
                    ctx.drawImage(asset, -this.tileSize / 2 + 2, -this.tileSize / 2 + 2, this.tileSize - 4, this.tileSize - 4);
                } else {
                    // Geometria procedural de segurança caso o ativo esteja carregando
                    ctx.fillStyle = '#4a0d0d';
                    ctx.fillRect(-this.tileSize / 2 + 4, -this.tileSize / 2 + 4, this.tileSize - 8, this.tileSize - 4);
                }

                // Brilho Neon Biomecânico de Operação Externa
                ctx.strokeStyle = `rgba(185, 28, 28, ${0.2 + Math.abs(Math.sin(this.pulseTime)) * 0.3})`;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize);

                ctx.restore();
            }
        }

        ctx.restore();

        // Camada de Efeito de Pós-Processamento: Vinheta Cinematográfica Dinâmica
        const vignetteGradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.75
        );
        
        let vignetteColor = 'rgba(0, 0, 0, 0.95)';
        if (globalState.currentWeather === 'TEMPESTADE_DE_CARNE') vignetteColor = 'rgba(40, 2, 2, 0.92)';
        if (globalState.currentWeather === 'ECLIPSE_MECANICO') vignetteColor = 'rgba(10, 5, 20, 0.98)';

        vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
        vignetteGradient.addColorStop(1, vignetteColor);
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Simulador de Glitch Estilo Monitor CRT em Crise Máxima
        if (this.glitchActive || (globalState.resources.insanity > 80 && Math.random() < 0.05)) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            for (let i = 0; i < this.canvas.height; i += 8) {
                if (Math.random() < 0.3) {
                    ctx.fillRect(0, i + Math.floor(Math.random() * 4), this.canvas.width, 2);
                }
            }
        }
    }
}
