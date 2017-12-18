const {createCanvas} = require('canvas');
const {directions, combinatorToNormal} = require("../utils");

function render (entity, grid, imageResolver) {
    let direction = entity.direction || 0;
    const base = imageResolver(entity.name + "_" + directions[direction]);

    if (entity.control_behavior !== undefined
        && entity.control_behavior.arithmetic_conditions !== undefined
        && entity.control_behavior.arithmetic_conditions.operation !== undefined) {

        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(base, 0, 0);
        const icon = imageResolver("display_" + combinatorToNormal[entity.control_behavior.arithmetic_conditions.operation]);

        if (icon) {
            if (direction === 0 || direction === 4) {
                ctx.drawImage(icon, 54, 36);
            } else {
                ctx.drawImage(icon, 54, 32);
            }
        }

        return canvas;
    }

    return base;
}

function renderShadow (entity, grid, imageResolver) {
    // No Shadow
}

function getKey (entity, grid) {
    if (entity.control_behavior !== undefined
        && entity.control_behavior.arithmetic_conditions !== undefined
        && entity.control_behavior.arithmetic_conditions.operation !== undefined) {
        return (entity.direction || 0) + "_" + entity.control_behavior.arithmetic_conditions.operation
    }

    return entity.direction || 0
}

module.exports = {
    render,
    renderShadow,
    getKey
};