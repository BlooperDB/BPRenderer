const {relativeDirections} = require("../utils");

function render (entity, grid, imageResolver) {
    const direction = entity.direction || 0;
    return imageResolver(entity.name + "_" + relativeDirections[direction]);
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    return entity.direction || 0
}

module.exports = {
    render,
    renderShadow,
    getKey
};