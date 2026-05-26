export class Blueprint {
    constructor(buildingType, reqWood, reqStone) {
        this.buildingType = buildingType;
        this.requiredWood = reqWood;
        this.requiredStone = reqStone;
        this.currentWood = 0;
        this.currentStone = 0;
        this.isFinished = false;
    }
}