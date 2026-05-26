// core/Components.js

export class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

export class CitizenInfo {
    constructor(name, age, profession = 'Desempregado') {
        this.name = name;
        this.age = age;
        this.profession = profession;
        this.isAlive = true;
    }
}

export class Needs {
    constructor() {
        this.hunger = 100; // 0 = Fome Extrema (Morte), 100 = Cheio
        this.warmth = 100; // 0 = Congelando (Morte), 100 = Aquecido
        this.energy = 100; // 0 = Exausto, 100 = Descansado
    }
}

export class Task {
    constructor(type, targetEntityId = null) {
        this.type = type; // 'COLETAR_MADEIRA', 'DORMIR', 'CONSTRUIR'
        this.target = targetEntityId;
        this.progress = 0;
    }
}