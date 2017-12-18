function render (entity, grid, imageResolver) {
    const direction = ((entity.direction || 0) === 0) ? "vertical" : "horizontal";
    return imageResolver(entity.name + "_" + direction);
}

function renderShadow (entity, grid, imageResolver) {
    const direction = ((entity.direction || 0) === 0) ? "vertical" : "horizontal";
    return imageResolver(entity.name + "_" + direction, true);
}

function getKey (entity, grid) {
    return entity.direction || 0
}

module.exports = {
    render,
    renderShadow,
    getKey
};