const {directions} = require("../utils");

function render (entity, grid, imageResolver) {
    return imageResolver(entity.name + "_" + directions[entity.direction || 0]);
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