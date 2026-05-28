
processThermalDynamics() {
    const gridSize = 1000; 
    
    // Difusão Térmica O(N) Otimizada
    for (let i = 0; i < this.thermalGrid.length; i++) {
        let localHeat = this.thermalGrid[i];
        
        // Penalidade Ambiental Brutal (Inverno Eterno)
        localHeat -= 0.05; 
        
        // Exemplo: Caldeiras injetam calor massivo nos nós centrais
        if (this.isBoilerNode(i)) {
            localHeat = 100.0;
        }

        this.nextThermalGrid[i] = Math.max(0, localHeat);
    }
    
    // Swap de buffers
    let temp = this.thermalGrid;
    this.thermalGrid = this.nextThermalGrid;
    this.nextThermalGrid = temp;
    
    // Atualiza Shaders Visuais
    this.updateThermalShaders();
}
