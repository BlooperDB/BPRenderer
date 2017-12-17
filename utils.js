const directions = {
    0: "north",
    2: "east",
    4: "south",
    6: "west",
};

const relativeDirections = {
    0: "up",
    2: "right",
    4: "down",
    6: "left",
};

function entitiesToGrid (entities) {
    const grid = {};

    for (let i in entities) {
        const entity = entities[i];
        if (grid[entity.position.x] === undefined) {
            grid[entity.position.x] = {}
        }

        grid[entity.position.x][entity.position.y] = entity;
    }

    return grid;
}

class EntityGridView {
    constructor (grid, centerX, centerY) {
        this.grid = grid;
        this.centerX = centerX;
        this.centerY = centerY;
    }

    getRelative (relativeX, relativeY) {
        const x = this.centerX + relativeX;
        const y = this.centerY + relativeY;

        if (this.grid[x] === undefined) {
            return undefined;
        }

        return this.grid[x][y];
    }

    setCenter(centerX, centerY){
        this.centerX = centerX;
        this.centerY = centerY;
    }
}

module.exports = {
    directions,
    relativeDirections,
    entitiesToGrid,
    EntityGridView
};