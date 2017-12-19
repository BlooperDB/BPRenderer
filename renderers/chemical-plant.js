const {createCanvas} = require('canvas');
const {directions} = require("../utils");

function render (entity, grid, imageResolver) {
    const base = imageResolver(entity.name + "_" + directions[entity.direction || 0]);

    if(entity.recipe !== undefined){
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(base, 0, 0);
        const icon = imageResolver("icon_" + entity.recipe);

        if(icon) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 - 10, 23, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fill();

            ctx.drawImage(icon, canvas.width / 2 - icon.width / 2, canvas.height / 2 - icon.height / 2 - 10);
        }

        return canvas;
    }

    return base;
}

function renderShadow (entity, grid, imageResolver) {
    return imageResolver(entity.name + "_" + directions[entity.direction || 0], true);
}

function getKey (entity, grid) {
    return (entity.recipe !== undefined ? entity.recipe : "") + "_" + (entity.direction || 0)
}

function getSize (entity) {
    return [3, 3]
}

module.exports = {
    render,
    renderShadow,
    getKey,
    getSize
};