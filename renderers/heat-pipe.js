const {isEntity, isEntityInDirection} = require("../utils");

function render (entity, grid, imageResolver) {
    const around = getAround(entity, grid);
    const count = around.reduce((a, b) => a + b, 0);

    let image;

    if (count === 0) {
        image = imageResolver("heat-pipe_single")
    } else if (count === 1) {
        if (around[0] === 1) {
            image = imageResolver("heat-pipe_ending_up")
        } else if (around[1] === 1) {
            image = imageResolver("heat-pipe_ending_right")
        } else if (around[2] === 1) {
            image = imageResolver("heat-pipe_ending_down")
        } else {
            image = imageResolver("heat-pipe_ending_left")
        }
    } else if (count === 2) {
        if (around[0] === 1) {
            if (around[1] === 1) {
                image = imageResolver("heat-pipe_corner_right_up")
            } else if (around[2] === 1) {
                image = imageResolver("heat-pipe_straight_vertical")
            } else if (around[3] === 1) {
                image = imageResolver("heat-pipe_corner_left_up")
            }
        } else if (around[1] === 1) {
            if (around[2] === 1) {
                image = imageResolver("heat-pipe_corner_right_down")
            } else if (around[3] === 1) {
                image = imageResolver("heat-pipe_straight_horizontal")
            }
        } else {
            image = imageResolver("heat-pipe_corner_left_down")
        }
    } else if (count === 3) {
        if (around[0] === 0) {
            image = imageResolver("heat-pipe_t_down")
        } else if (around[1] === 0) {
            image = imageResolver("heat-pipe_t_left")
        } else if (around[2] === 0) {
            image = imageResolver("heat-pipe_t_up")
        } else if (around[3] === 0) {
            image = imageResolver("heat-pipe_t_right")
        }
    } else {
        image = imageResolver("heat-pipe_cross")
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
        isHeatPipe(grid.getRelative(0, -1))
        || isHeatExchanger(grid.getRelative(0, -1.5), 0)

        || isReactor(grid.getRelative(-2, -3))
        || isReactor(grid.getRelative(0, -3))
        || isReactor(grid.getRelative(2, -3)),

        // East
        isHeatPipe(grid.getRelative(1, 0))
        || isHeatExchanger(grid.getRelative(1.5, 0), 2)

        || isReactor(grid.getRelative(3, -2))
        || isReactor(grid.getRelative(3, 0))
        || isReactor(grid.getRelative(3, 2)),

        // South
        isHeatPipe(grid.getRelative(0, 1))
        || isHeatExchanger(grid.getRelative(0, 1.5), 4)

        || isReactor(grid.getRelative(-2, 3))
        || isReactor(grid.getRelative(0, 3))
        || isReactor(grid.getRelative(2, 3)),

        // West
        isHeatPipe(grid.getRelative(-1, 0))
        || isHeatExchanger(grid.getRelative(-1.5, 0), 6)

        || isReactor(grid.getRelative(-3, -2))
        || isReactor(grid.getRelative(-3, 0))
        || isReactor(grid.getRelative(-3, 2))
    ]
}

function isHeatPipe (entity) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "heat-pipe") {
        return 1;
    }

    return 0;
}

function isHeatExchanger (entity, direction) {
    return isEntityInDirection(entity, "heat-exchanger", direction);
}

function isReactor (entity) {
    return isEntity(entity, "nuclear-reactor");
}

module.exports = {
    render,
    renderShadow,
    getKey
};