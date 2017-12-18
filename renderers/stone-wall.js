const {isEntity, isEntityInDirection} = require("../utils");

function render (entity, grid, imageResolver) {
    return imageResolver(getName(entity, grid));
}

function renderShadow (entity, grid, imageResolver) {
    return imageResolver(getName(entity, grid), true);
}

function getName (entity, grid) {
    const around = getAround(entity, grid);
    const count = around.reduce((a, b) => a + b, 0);

    if (count === 0) {
        return "stone-wall_single"
    } else if (count === 1) {
        if (around[0] === 1) {
            return "stone-wall_single"
        } else if (around[1] === 1) {
            return "stone-wall_ending_right"
        } else if (around[2] === 1) {
            return "stone-wall_straight_vertical"
        } else {
            return "stone-wall_ending_left"
        }
    } else if (count === 2) {
        if (around[0] === 1) {
            if (around[1] === 1) {
                return "stone-wall_ending_right"
            } else if (around[2] === 1) {
                return "stone-wall_straight_vertical"
            } else if (around[3] === 1) {
                return "stone-wall_ending_left"
            }
        } else if (around[1] === 1) {
            if (around[2] === 1) {
                return "stone-wall_corner_right_down"
            } else if (around[3] === 1) {
                return "stone-wall_straight_horizontal"
            }
        } else {
            return "stone-wall_corner_left_down"
        }
    } else if (count === 3) {
        if (around[0] === 0) {
            return "stone-wall_t_up"
        } else if (around[1] === 0) {
            return "stone-wall_corner_left_down"
        } else if (around[2] === 0) {
            return "stone-wall_straight_horizontal"
        } else if (around[3] === 0) {
            return "stone-wall_corner_right_down"
        }
    } else {
        return "stone-wall_t_up"
    }
}

function getKey (entity, grid) {
    return getAround(entity, grid).join("_")
}

function getAround (entity, grid) {
    return [
        // North
        isStoneWall(grid.getRelative(0, -1))
        || isGate(grid.getRelative(0, -1), 0),

        // East
        isStoneWall(grid.getRelative(1, 0))
        || isGate(grid.getRelative(1, 0), 2),

        // South
        isStoneWall(grid.getRelative(0, 1))
        || isGate(grid.getRelative(0, 1), 0),

        // West
        isStoneWall(grid.getRelative(-1, 0))
        || isGate(grid.getRelative(-1, 0), 2)
    ]
}

function isStoneWall (entity) {
    return isEntity(entity, "stone-wall");
}

function isGate (entity, direction) {
    return isEntityInDirection(entity, "gate", direction);
}

module.exports = {
    render,
    renderShadow,
    getKey
};