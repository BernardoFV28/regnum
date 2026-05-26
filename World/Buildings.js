// Dicionário Global de Construções Biomecânicas
const BUILDING_CATALOG = {
    'incubadora': { 
        id: 'incubadora', name: 'Incubadora de Carne', 
        cost: { copper: 50, biomass: 0 }, 
        prod: { biomass: 15, copper: 0, steam: 0, pop: 0 }, 
        consume: { steam: 2, biomass: 0 }, 
        desc: 'Cultiva tecidos orgânicos. Consome Vapor para evitar congelamento.'
    },
    'extrator': { 
        id: 'extrator', name: 'Extrator de Veias', 
        cost: { copper: 0, biomass: 80 }, 
        prod: { copper: 20, biomass: 0, steam: 0, pop: 0 }, 
        consume: { steam: 3, biomass: 5 }, 
        desc: 'Perfura o solo em busca de cobre corroído. Exige lubrificação orgânica (Biomassa).'
    },
    'caldeira': { 
        id: 'caldeira', name: 'Caldeira de Sangue', 
        cost: { copper: 120, biomass: 0 }, 
        prod: { steam: 25, biomass: 0, copper: 0, pop: 0 }, 
        consume: { biomass: 10, steam: 0 }, 
        desc: 'Incinera carne crua para gerar a pressão de Vapor necessária para a colónia.'
    },
    'casulo': { 
        id: 'casulo', name: 'Casulos de Gestação', 
        cost: { copper: 100, biomass: 100 }, 
        prod: { pop: 2, steam: 0, biomass: 0, copper: 0 }, 
        consume: { steam: 4, biomass: 5 }, 
        desc: 'Gera novos trabalhadores ciborgues. Alto consumo térmico.'
    },
    'torre_purga': { 
        id: 'torre_purga', name: 'Torre de Purgação (Defesa)', 
        cost: { copper: 250, biomass: 50 }, 
        prod: { defense: 10, steam: 0, biomass: 0, copper: 0, pop: 0 }, 
        consume: { steam: 5, biomass: 0 }, 
        desc: 'Essencial para sobreviver ao Dia 10. Dispara vapor superaquecido.'
    }
};