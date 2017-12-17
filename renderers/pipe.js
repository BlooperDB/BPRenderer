const {createCanvas} = require('canvas');

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
    } else if (count === 4) {
        image = imageResolver("pipe_cross")
    }

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return canvas;
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    return getAround(entity, grid).join("_")
}

function getAround (entity, grid) {
    return [
        isPipe(grid.getRelative(0, -1)),
        isPipe(grid.getRelative(1, 0)),
        isPipe(grid.getRelative(0, 1)),
        isPipe(grid.getRelative(-1, 0))
    ];
}

function isPipe (entity) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "pipe") {
        return 1;
    } else if (entity.name === "pipe-to-ground") {
        return 1;
    }

    return 0;
}

module.exports = {
    render,
    renderShadow,
    getKey
};