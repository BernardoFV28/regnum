export class Health {
    constructor(maxHp) {
        this.current = maxHp;
        this.max = maxHp;
    }
}

export class CombatStats {
    constructor(attack, defense, faction) {
        this.attack = attack;
        this.defense = defense;
        this.faction = faction; // 'JOGADOR', 'BANDIDOS', 'NOBRE_RIVAL'
    }
}