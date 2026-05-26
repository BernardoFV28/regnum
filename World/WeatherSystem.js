export class WeatherSystem {
    constructor(eventBus) {
        this.globalTemperature = 20; // Celsius
        this.isRaining = false;
        this.isSnowing = false;

        eventBus.on('SEASON_CHANGED', (data) => {
            switch(data.newSeason) {
                case 'INVERNO': this.globalTemperature = -15; this.isSnowing = true; break;
                case 'VERÃO': this.globalTemperature = 30; this.isSnowing = false; break;
                case 'OUTONO': this.globalTemperature = 10; break;
                case 'PRIMAVERA': this.globalTemperature = 18; this.isRaining = true; break;
            }
            eventBus.emit('TEMPERATURE_CHANGED', { temp: this.globalTemperature });
        });
    }
}