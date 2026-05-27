
export class VisceralRenderPipeline {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.shakeIntensity = 0;
        this.chromaticOffset = 0;
    }

    triggerShake(amount) {
        this.shakeIntensity = amount;
    }

    applyEffects(state, renderBufferCallback) {
        this.ctx.save();

        // 1. Processamento Matemático do Temor de Tela (Damping Mecânico)
        if (this.shakeIntensity > 0.1) {
            let dx = (Math.random() - 0.5) * this.shakeIntensity;
            let dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
            this.shakeIntensity *= 0.88; // Amortecimento por frame
        }

        // Executa a chamada do buffer geométrico padrão do motor
        renderBufferCallback();

        this.ctx.restore();

        // 2. Injeção da Vinheta de Sangue e Coagulação em Crises
        if (state.collectiveFear > 50) {
            let opacity = (state.collectiveFear - 50) / 50 * 0.4;
            let grad = this.ctx.createRadialGradient(
                this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.3,
                this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.8
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(90, 2, 2, ${opacity})`);
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 3. Simulação visual de geada se a pressão de vapor entrar em colapso
        if (state.steamPressure < 25) {
            this.ctx.fillStyle = 'rgba(100, 180, 255, 0.12)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}
