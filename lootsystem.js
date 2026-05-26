export class lootsystem {
    constructor() {
        this.prefixes = ["Enferrujado", "Corrompido", "Divino", "Sintético"];
        this.types = ["Núcleo", "Lâmina", "Engrenagem", "Relíquia"];
    }

    generateLoot(monsterLevel) {
        const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const power = Math.floor(Math.random() * 10 * monsterLevel);

        return {
            name: `${prefix} ${type}`,
            bonus: power,
            rarity: power > 50 ? 'Raro' : 'Comum',
            description: `Um fragmento de ${prefix.toLowerCase()} coletado dos restos da máquina.`
        };
    }
}