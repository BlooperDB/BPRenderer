const {createCanvas} = require('canvas');

function render (entity, grid, imageResolver) {
    const base = imageResolver(entity.name);

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
    return imageResolver(entity.name, true);
}

function getKey (entity, grid) {
    return (entity.recipe !== undefined ? entity.recipe : "")
}

module.exports = {
    render,
    renderShadow,
    getKey
};