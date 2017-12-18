const {createCanvas} = require('canvas');

function render (entity, grid, imageResolver) {
    const direction = entity.direction || 0;
    const image = imageResolver(entity.name + "_picture");

    if(direction === 0){
        return image;
    }

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.translate(image.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0);
    return canvas;
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