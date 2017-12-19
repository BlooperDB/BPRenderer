const {createCanvas} = require('canvas');

function render (entity, grid, imageResolver) {
    const around = getAround(entity, grid);
    const count = around.reduce((a, b) => a + b, 0);
    const direction = entity.direction || 0;
    let degreeOffset = 90;

    let image;

    if (count === 0 || count === 2 || count === 3) {
        if(direction === 0 || direction === 4){
            image = imageResolver(entity.name + "_vertical");
            degreeOffset = 0
        }else{
            image = imageResolver(entity.name + "_horizontal");
        }
    } else if (count === 1) {
        if (around[0] === 1) {
            if (direction === 0 || direction === 4) {
                image = imageResolver(entity.name + "_vertical");
                degreeOffset = 0
            } else if (direction === 2) {
                image = imageResolver(entity.name + "_bend_left");
            } else if (direction === 6) {
                image = imageResolver(entity.name + "_bend_right");
                degreeOffset = 0
            }
        } else if (around[1] === 1) {
            if (direction === 2 || direction === 6) {
                image = imageResolver(entity.name + "_horizontal");
            } else if (direction === 0) {
                image = imageResolver(entity.name + "_bend_right");
                degreeOffset = 0
            } else if (direction === 4) {
                image = imageResolver(entity.name + "_bend_left");
            }
        } else if (around[2] === 1) {
            if (direction === 0 || direction === 4) {
                image = imageResolver(entity.name + "_vertical");
                degreeOffset = 0
            } else if (direction === 2) {
                image = imageResolver(entity.name + "_bend_right");
                degreeOffset = 0
            } else if (direction === 6) {
                image = imageResolver(entity.name + "_bend_left");
            }
        } else if (around[3] === 1) {
            if (direction === 2 || direction === 6) {
                image = imageResolver(entity.name + "_horizontal");
            } else if (direction === 0) {
                image = imageResolver(entity.name + "_bend_left");
            } else if (direction === 4) {
                image = imageResolver(entity.name + "_bend_right");
                degreeOffset = 0
            }
        }
    }

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.translate(image.width / 2, image.height / 2);
    ctx.rotate(((direction * 45) - degreeOffset) * Math.PI / 180);
    ctx.drawImage(image, (image.width / 2) * -1, (image.height / 2) * -1);
    return canvas;
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    return (entity.direction || 0) + "_" + getAround(entity, grid).join("_")
}

function getAround (entity, grid) {
    return [
        isTransportBelt(grid.getRelative(0, -1), 4) || isSplitter(grid.getRelative(0.5, -1), 4) || isSplitter(grid.getRelative(-0.5, -1), 4),
        isTransportBelt(grid.getRelative(1, 0), 6) || isSplitter(grid.getRelative(1, 0.5), 6) || isSplitter(grid.getRelative(1, -0.5), 6),
        isTransportBelt(grid.getRelative(0, 1), 0) || isSplitter(grid.getRelative(0.5, 1), 0) || isSplitter(grid.getRelative(-0.5, 1), 0),
        isTransportBelt(grid.getRelative(-1, 0), 2) || isSplitter(grid.getRelative(-1, 0.5), 2) || isSplitter(grid.getRelative(-1, -0.5), 2)
    ];
}

function isTransportBelt (entity, direction) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "transport-belt" || entity.name === "fast-transport-belt" || entity.name === "express-transport-belt") {
        if ((entity.direction || 0) === direction) {
            return 1;
        }
    }

    if (entity.name === "underground-belt" || entity.name === "fast-underground-belt" || entity.name === "express-underground-belt") {
        if (entity.type === "output") {
            if ((entity.direction || 0) === direction) {
                return 1;
            }
        }
    }

    return 0;
}

function isSplitter (entity, direction) {
    if (entity === undefined) {
        return 0;
    }

    if (entity.name === "splitter" || entity.name === "fast-splitter" || entity.name === "express-splitter") {
        if ((entity.direction || 0) === direction) {
            return 1;
        }
    }

    return 0;
}

function getSize (entity) {
    return [1, 1]
}

module.exports = {
    render,
    renderShadow,
    getKey,
    getSize
};