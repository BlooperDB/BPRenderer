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

function getSize (entity) {
    switch (entity.direction || 0){
        default:
            return [3, 5];
        case 2:
        case 6:
            return [5, 3];
    }
}

module.exports = {
    render,
    renderShadow,
    getKey,
    getSize
};