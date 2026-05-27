// game-loop.js - Gerenciamento de Frame Pacing Dinâmico
export class DeterministicGameLoop {
    constructor(tickRate = 30) {
        this.tickRate = tickRate;
        this.fixedDelta = 1000 / this.tickRate;
        this.accumulatedTime = 0;
        this.lastFrameTime = 0;
        this.isRunning = false;
        
        this.onUpdate = () => {};
        this.onRender = () => {};
    }

    start(updateCb, renderCb) {
        this.onUpdate = updateCb;
        this.onRender = renderCb;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.run(t));
    }

    run(currentTime) {
        if (!this.isRunning) return;

        let frameTime = currentTime - this.lastFrameTime;
        if (frameTime > 250) frameTime = 250; // Trava de pânico contra congelamento de abas
        this.lastFrameTime = currentTime;

        this.accumulatedTime += frameTime;

        while (this.accumulatedTime >= this.fixedDelta) {
            this.onUpdate(this.fixedDelta / 1000);
            this.accumulatedTime -= this.fixedDelta;
        }

        const interpolationAlpha = this.accumulatedTime / this.fixedDelta;
        this.onRender(interpolationAlpha);

        requestAnimationFrame((t) => this.run(t));
    }

    stop() {
        this.isRunning = false;
    }
}
