const {isEntityInDirection, recipeHasFluids} = require("../utils");
const {getRecipes} = require("../factorio");

// TODO Machine interactions
function render (entity, grid, imageResolver) {
    const around = getAround(entity, grid);
    const count = around.reduce((a, b) => a + b, 0);

    let image;

    if (count === 0) {
        image = imageResolver("pipe_straight_horizontal")
    } else if (count === 1) {
        if (around[0] === 1) {
            image = imageResolver("pipe_ending_up")
        } else if (around[1] === 1) {
            image = imageResolver("pipe_ending_right")
        } else if (around[2] === 1) {
            image = imageResolver("pipe_ending_down")
        } else {
            image = imageResolver("pipe_ending_left")
        }
    } else if (count === 2) {
        if (around[0] === 1) {
            if (around[1] === 1) {
                image = imageResolver("pipe_corner_up_right")
            } else if (around[2] === 1) {
                image = imageResolver("pipe_straight_vertical")
            } else if (around[3] === 1) {
                image = imageResolver("pipe_corner_up_left")
            }
        } else if (around[1] === 1) {
            if (around[2] === 1) {
                image = imageResolver("pipe_corner_down_right")
            } else if (around[3] === 1) {
                image = imageResolver("pipe_straight_horizontal")
            }
        } else {
            image = imageResolver("pipe_corner_down_left")
        }
    } else if (count === 3) {
        if (around[0] === 0) {
            image = imageResolver("pipe_t_down")
        } else if (around[1] === 0) {
            image = imageResolver("pipe_t_left")
        } else if (around[2] === 0) {
            image = imageResolver("pipe_t_up")
        } else if (around[3] === 0) {
            image = imageResolver("pipe_t_right")
        }
    } else {
        image = imageResolver("pipe_cross")
    }

    return image;
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    return getAround(entity, grid).join("_")
}

function getAround (entity, grid) {
    return [
        // North
        isPipe(grid.getRelative(0, -1), 4)
        || isChemicalPlant(grid.getRelative(1, -2), 0, 4)
        || isChemicalPlant(grid.getRelative(-1, -2), 0, 4)

        || isStorageTank(grid.getRelative(1, -2), 2)
        || isStorageTank(grid.getRelative(-1, -2), 0)

        || isOilRefinery(grid.getRelative(1, -3), 0)
        || isOilRefinery(grid.getRelative(-1, -3), 0)
        || isOilRefinery(grid.getRelative(2, -3), 4)
        || isOilRefinery(grid.getRelative(0, -3), 4)
        || isOilRefinery(grid.getRelative(-2, -3), 4)

        || isSteamEngine(grid.getRelative(0, -3), 0)
        || isSteamTurbine(grid.getRelative(0, -3), 0)

        || isBoiler(grid.getRelative(0.5, -2), 2)
        || isBoiler(grid.getRelative(0, -1.5), 4)
        || isBoiler(grid.getRelative(-0.5, -2), 6)

        || isHeatExchanger(grid.getRelative(0.5, -2), 2)
        || isHeatExchanger(grid.getRelative(0, -1.5), 4)
        || isHeatExchanger(grid.getRelative(-0.5, -2), 6)

        || isFlamethrower(grid.getRelative(1, -1.5), 2)
        || isFlamethrower(grid.getRelative(-1, -1.5), 6)

        || isAssembler(grid.getRelative(0, -2), 4)

        || isOffshorePump(grid.getRelative(0, -1), 0),

        // East
        isPipe(grid.getRelative(1, 0), 6)
        || isChemicalPlant(grid.getRelative(2, 1), 2, 6)
        || isChemicalPlant(grid.getRelative(2, -1), 2, 6)

        || isStorageTank(grid.getRelative(2, 1), 0)
        || isStorageTank(grid.getRelative(2, -1), 2)

        || isOilRefinery(grid.getRelative(3, 1), 2)
        || isOilRefinery(grid.getRelative(3, -1), 2)
        || isOilRefinery(grid.getRelative(3, 2), 6)
        || isOilRefinery(grid.getRelative(3, 0), 6)
        || isOilRefinery(grid.getRelative(3, -2), 6)

        || isSteamEngine(grid.getRelative(3, 0), 2)
        || isSteamTurbine(grid.getRelative(3, 0), 2)

        || isBoiler(grid.getRelative(2, -0.5), 0)
        || isBoiler(grid.getRelative(2, 0.5), 4)
        || isBoiler(grid.getRelative(1.5, 0), 6)

        || isHeatExchanger(grid.getRelative(2, -0.5), 0)
        || isHeatExchanger(grid.getRelative(2, 0.5), 4)
        || isHeatExchanger(grid.getRelative(1.5, 0), 6)

        || isFlamethrower(grid.getRelative(1.5, -1), 0)
        || isFlamethrower(grid.getRelative(1.5, 1), 4)

        || isAssembler(grid.getRelative(2, 0), 6)

        || isOffshorePump(grid.getRelative(1, 0), 2),

        // South
        isPipe(grid.getRelative(0, 1), 0)
        || isChemicalPlant(grid.getRelative(1, 2), 0, 4)
        || isChemicalPlant(grid.getRelative(-1, 2), 0, 4)

        || isStorageTank(grid.getRelative(1, 2), 0)
        || isStorageTank(grid.getRelative(-1, 2), 2)

        || isOilRefinery(grid.getRelative(1, 3), 4)
        || isOilRefinery(grid.getRelative(-1, 3), 4)
        || isOilRefinery(grid.getRelative(2, 3), 0)
        || isOilRefinery(grid.getRelative(0, 3), 0)
        || isOilRefinery(grid.getRelative(-2, 3), 0)

        || isSteamEngine(grid.getRelative(0, 3), 0)
        || isSteamTurbine(grid.getRelative(0, 3), 0)

        || isBoiler(grid.getRelative(0.5, 2), 2)
        || isBoiler(grid.getRelative(0, 1.5), 0)
        || isBoiler(grid.getRelative(-0.5, 2), 6)

        || isHeatExchanger(grid.getRelative(0.5, 2), 2)
        || isHeatExchanger(grid.getRelative(0, 1.5), 0)
        || isHeatExchanger(grid.getRelative(-0.5, 2), 6)

        || isFlamethrower(grid.getRelative(1, 1.5), 2)
        || isFlamethrower(grid.getRelative(-1, 1.5), 6)

        || isAssembler(grid.getRelative(0, 2), 0)

        || isOffshorePump(grid.getRelative(0, 1), 4),

        // West
        isPipe(grid.getRelative(-1, 0), 2)
        || isChemicalPlant(grid.getRelative(-2, 1), 2, 6)
        || isChemicalPlant(grid.getRelative(-2, -1), 2, 6)

        || isStorageTank(grid.getRelative(-2, 1), 2)
        || isStorageTank(grid.getRelative(-2, -1), 0)

        || isOilRefinery(grid.getRelative(-3, 1), 6)
        || isOilRefinery(grid.getRelative(-3, -1), 6)
        || isOilRefinery(grid.getRelative(-3, 2), 2)
        || isOilRefinery(grid.getRelative(-3, 0), 2)
        || isOilRefinery(grid.getRelative(-3, -2), 2)

        || isSteamEngine(grid.getRelative(-3, 0), 2)
        || isSteamTurbine(grid.getRelative(-3, 0), 2)

        || isBoiler(grid.getRelative(-2, -0.5), 0)
        || isBoiler(grid.getRelative(-2, 0.5), 4)
        || isBoiler(grid.getRelative(-1.5, 0), 2)

        || isHeatExchanger(grid.getRelative(-2, -0.5), 0)
        || isHeatExchanger(grid.getRelative(-2, 0.5), 4)
        || isHeatExchanger(grid.getRelative(-1.5, 0), 2)

        || isFlamethrower(grid.getRelative(-1.5, -1), 0)
        || isFlamethrower(grid.getRelative(-1.5, 1), 4)

        || isAssembler(grid.getRelative(-2, 0), 2)

        || isOffshorePump(grid.getRelative(-1, 0), 6)
    ];
}

function isPipe (entity, direction) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "pipe") {
        return 1;
    } else if (entity.name === "pipe-to-ground") {
        if ((entity.direction || 0) === direction) {
            return 1;
        }
    }

    return 0;
}

function isChemicalPlant (entity, direction1, direction2) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "chemical-plant") {
        if ((entity.direction || 0) === direction1 || (entity.direction || 0) === direction2) {
            return 1;
        }
    }

    return 0;
}

function isStorageTank (entity, direction) {
    return isEntityInDirection(entity, "storage-tank", direction);
}

function isOilRefinery (entity, direction) {
    return isEntityInDirection(entity, "oil-refinery", direction);
}

function isSteamEngine (entity, direction) {
    return isEntityInDirection(entity, "steam-engine", direction);
}

function isSteamTurbine (entity, direction) {
    return isEntityInDirection(entity, "steam-turbine", direction);
}

function isBoiler (entity, direction) {
    return isEntityInDirection(entity, "boiler", direction);
}

function isFlamethrower (entity, direction) {
    return isEntityInDirection(entity, "flamethrower-turret", direction);
}

function isHeatExchanger (entity, direction) {
    return isEntityInDirection(entity, "heat-exchanger", direction);
}

function isOffshorePump (entity, direction) {
    return isEntityInDirection(entity, "offshore-pump", direction);
}

function isAssembler (entity, direction) {
    if (isEntityInDirection(entity, "assembling-machine-2", direction) || isEntityInDirection(entity, "assembling-machine-3", direction)) {
        if (entity.recipe !== undefined && recipeHasFluids(getRecipes()[entity.recipe])) {
            return 1;
        }
    }
    return 0;
}

function getSize (entity) {
    return [1 ,1]
}

module.exports = {
    render,
    renderShadow,
    getKey,
    getSize
};