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

function getSize (entity) {
    switch (entity.direction || 0){
        default:
            return [1, 2];
        case 2:
        case 6:
            return [2, 1];
    }
}

module.exports = {
    render,
    renderShadow,
    getKey,
    getSize
};