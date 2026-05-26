export class TimeManager {
    constructor(eventBus) {
        this.events = eventBus;
        this.day = 1;
        this.hour = 8; // Começa às 8h da manhã
        this.season = 'PRIMAVERA'; // PRIMAVERA, VERÃO, OUTONO, INVERNO
        this.daysPerSeason = 15; 
        
        this.events.on('TIME_TICK', (data) => this.update(data.delta));
    }

    update(deltaTime) {
        // 1 segundo real = 1 hora no jogo (ajustável pela timeScale da engine)
        this.hour += deltaTime; 

        if (this.hour >= 24) {
            this.hour = 0;
            this.day++;
            this.events.emit('NEW_DAY', { day: this.day, season: this.season });
            this.checkSeasonChange();
        }
    }

    checkSeasonChange() {
        if (this.day > this.daysPerSeason) {
            this.day = 1;
            const seasons = ['PRIMAVERA', 'VERÃO', 'OUTONO', 'INVERNO'];
            const currentIndex = seasons.indexOf(this.season);
            this.season = seasons[(currentIndex + 1) % seasons.length];
            
            this.events.emit('SEASON_CHANGED', { newSeason: this.season });
            
            if (this.season === 'INVERNO') {
                this.events.emit('CRISIS_ALERT', { text: "O Inverno chegou. Que Deus nos proteja." });
            }
        }
    }
}