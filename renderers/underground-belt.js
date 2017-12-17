const {relativeDirections} = require("../utils");

function render (entity, grid, imageResolver) {
    const type = entity.type || "input";
    const direction = entity.direction || 0;
    return imageResolver(entity.name + "_" + (type === "input" ? "in" : "out") + "_" + relativeDirections[direction]);
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    return (entity.direction || 0) + "_" + (entity.type || "input")
}

module.exports = {
    render,
    renderShadow,
    getKey
};