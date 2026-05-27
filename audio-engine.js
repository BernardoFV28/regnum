// audio-engine.js - Mecanismo de Síntese Biomecânica de Áudio
export class BiopunkAudioEngine {
    constructor() {
        this.ctx = null;
        this.drone = null;
    }

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Canal de Baixa Frequência para a Atmosfera (Industrial Drone)
        this.drone = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        
        this.drone.type = 'sawtooth';
        this.drone.frequency.value = 55; // Nota Lá (A1) profunda e industrial
        
        this.droneGain.gain.value = 0.04;
        
        // Filtro passa-baixa para dar peso de confinamento subterrâneo
        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;

        this.drone.connect(filter);
        filter.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);
        
        this.drone.start();
    }

    playVisceralClick() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }
}
