const {createCanvas} = require('canvas');
const {getRecipes} = require("../factorio");
const {directions, recipeHasFluids} = require("../utils");

function render (entity, grid, imageResolver) {
    if (entity.recipe !== undefined) {
        let base;

        if (recipeHasFluids(getRecipes()[entity.recipe])) {
            const direction = entity.direction || 0;
            const connector = imageResolver(entity.name + "_pipe_" + directions[direction]);
            if(connector){
                const assembler = imageResolver(entity.name);
                const canvas = createCanvas(assembler.width, assembler.height);
                const ctx = canvas.getContext("2d");
                if(direction === 0){
                    ctx.drawImage(connector, Math.floor(canvas.width / 2 - connector.width / 2), Math.floor(canvas.height / 2 - connector.height / 2));
                    ctx.drawImage(assembler, 0, 0);
                }else{
                    ctx.drawImage(assembler, 0, 0);
                    ctx.drawImage(connector, Math.floor(canvas.width / 2 - connector.width / 2), Math.floor(canvas.height / 2 - connector.height / 2));
                }
                base = canvas;
            }
        }

        if (!base) {
            base = imageResolver(entity.name)
        }

        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(base, 0, 0);
        const icon = imageResolver("icon_" + entity.recipe);

        if (icon) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 - 10, 23, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fill();

            ctx.drawImage(icon, canvas.width / 2 - icon.width / 2, canvas.height / 2 - icon.height / 2 - 10);
        }

        return canvas;
    }

    return imageResolver(entity.name);
}

function renderShadow (entity, grid, imageResolver) {
    return imageResolver(entity.name, true);
}

function getKey (entity, grid) {
    return (entity.recipe !== undefined ? entity.recipe : "") + "_" + entity.direction
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