const {entitiesToGrid, EntityGridView} = require("./utils");
const zlib = require('zlib');

const renderers = {
    "transport-belt": "transport-belt",
    "fast-transport-belt": "transport-belt",
    "express-transport-belt": "transport-belt",
    "underground-belt": "underground-belt",
    "fast-underground-belt": "underground-belt",
    "express-underground-belt": "underground-belt",
    "splitter": "splitter",
    "fast-splitter": "splitter",
    "express-splitter": "splitter",
    "pipe": "pipe",
    "pipe-to-ground": "pipe-to-ground",
    "stack-inserter": "inserter",
    "long-handed-inserter": "inserter",
    "fast-inserter": "inserter",
    "inserter": "inserter",
    "filter-inserter": "inserter",
    "stack-filter-inserter": "inserter",
    "burner-inserter": "inserter",
    "assembling-machine-1": "assembling-machine",
    "assembling-machine-2": "assembling-machine",
    "assembling-machine-3": "assembling-machine",
    "chemical-plant": "chemical-plant",
    "storage-tank": "storage-tank",
    "oil-refinery": "oil-refinery",
    "decider-combinator": "decider-combinator",
    "arithmetic-combinator": "arithmetic-combinator",
    "pump": "pump",
    "heat-pipe": "heat-pipe",
    "stone-wall": "stone-wall",
    "gate": "gate",
    "boiler": "boiler",
    "heat-exchanger": "heat-exchanger",
    "steam-engine": "steam-engine",
    "steam-turbine": "steam-turbine",
    "constant-combinator": "constant-combinator",
    "electric-mining-drill": "electric-mining-drill"
};

let gameData = null;

class Blueprint {

    constructor (data) {
        if (gameData == null) {
            throw "Game data not loaded!"
        }

        this.icons = data['blueprint']['icons'];
        this.entities = data['blueprint']['entities'];
        this.grid = entitiesToGrid(this.entities);
        this.entities.sort(function (a, b) {
            if(a.name.endsWith("transport-belt") || a.name.endsWith("splitter")){
                return -1;
            }else if(b.name.endsWith("transport-belt") || b.name.endsWith("splitter")){
                return 1;
            }

            if(a.name === "pipe" || a.name === "pipe-to-ground"){
                return -1;
            }else if(b.name === "pipe" || b.name === "pipe-to-ground"){
                return 1;
            }

            if(a.name.endsWith("electric-pole") || a.name.endsWith("substation")){
                return 1;
            }else if(b.name.endsWith("electric-pole") || b.name.endsWith("substation")){
                return -1;
            }

            if(a.name.endsWith("inserter")){
                return 1;
            }else if(b.name.endsWith("inserter")){
                return -1;
            }


            if (a.position.y !== b.position.y) {
                return a.position.y - b.position.y
            }

            return a.position.x - b.position.x
        })
    }

    getSize () {
        let minWidth = 0;
        let minHeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        for (let i = 0; i < this.entities.length; i++) {
            const position = this.entities[i]['position'];
            minWidth = Math.min(minWidth, position['x']);
            minHeight = Math.min(minHeight, position['y']);
            maxWidth = Math.max(maxWidth, position['x']);
            maxHeight = Math.max(maxHeight, position['y']);
        }

        return {
            minX: minWidth,
            minY: minHeight,
            maxX: maxWidth,
            maxY: maxHeight,
            width: Math.abs(minWidth) + maxWidth + 1,
            height: Math.abs(minHeight) + maxHeight + 1
        }
    }

    /**
     * @param canvas {HTMLCanvasElement}
     * @param imageResolver {function(string, boolean)}
     */
    render (canvas, imageResolver) {
        const size = this.getSize();
        const scaling = Math.min(canvas.width / (size.width + 2), canvas.height / (size.height + 2));

        /**
         * @type {CanvasRenderingContext2D}
         */
        const ctx = canvas.getContext("2d");

        // Color in background
        ctx.fillStyle = "#282828";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Line styling
        ctx.fillStyle = "#3c3c3c";
        const lineWidth = 2;

        // Vertical lines
        for (let i = 1; i < size.width + 2; i++) {
            ctx.fillRect(i * scaling - (lineWidth / 2), 0, lineWidth, canvas.height)
        }

        // Horizontal lines
        for (let i = 1; i < size.height + 2; i++) {
            ctx.fillRect(0, i * scaling - (lineWidth / 2), canvas.width, lineWidth)
        }

        // Numbering styling
        ctx.fillStyle = "#3c3c3c";
        ctx.font = "24px Arial Bold";
        ctx.textAlign = "center";

        // Width numbering
        for (let i = 1; i < size.width + 1; i++) {
            ctx.fillText("" + i, i * scaling + (scaling / 2), scaling - 7, scaling - (scaling / 8));
            ctx.fillText("" + i, i * scaling + (scaling / 2), canvas.height - 7, scaling - (scaling / 8));
        }

        // Height numbering
        for (let i = 1; i < size.height + 1; i++) {
            ctx.fillText("" + i, scaling / 2, ((i + 1) * scaling) - 7, scaling - (scaling / 8));
            ctx.fillText("" + i, canvas.width - (scaling / 2), ((i + 1) * scaling) - 7, scaling - (scaling / 8));
        }

        // Draw entities
        const gridView = new EntityGridView(this.grid, 0, 0);

        // First pass: shadows
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const position = entity['position'];
            const relativeX = position.x + Math.abs(size.minX) + 1;
            const relativeY = position.y + Math.abs(size.minY) + 1;

            gridView.setCenter(position.x, position.y);

            let image = undefined;

            if (renderers[entity.name] !== undefined) {
                image = cachedRenderer(entity, gridView, imageResolver, true);
            } else {
                image = imageResolver(entity.name, true);
            }

            if (image) {
                const startX = (relativeX * scaling + (scaling / 2)) - (image.width / 2);
                const startY = (relativeY * scaling + (scaling / 2)) - (image.height / 2);
                ctx.drawImage(image, startX, startY, image.width, image.height)
            }
        }

        // Second pass: entities
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const position = entity['position'];
            const relativeX = position.x + Math.abs(size.minX) + 1;
            const relativeY = position.y + Math.abs(size.minY) + 1;

            gridView.setCenter(position.x, position.y);

            let image = undefined;

            if (renderers[entity.name] !== undefined) {
                image = cachedRenderer(entity, gridView, imageResolver, false);
            } else {
                image = imageResolver(entity.name, false);
            }

            if (image) {
                const startX = Math.floor((relativeX * scaling + (scaling / 2)) - (image.width / 2));
                const startY = Math.floor((relativeY * scaling + (scaling / 2)) - (image.height / 2));
                ctx.drawImage(image, startX, startY, image.width, image.height)
            } else {
                console.log("Missing", entity.name);
                ctx.fillStyle = "#880000";
                ctx.fillRect(relativeX * scaling, relativeY * scaling, scaling, scaling);
                ctx.fillStyle = "#000088";
                ctx.fillRect(relativeX * scaling + (scaling / 2 - 1), relativeY * scaling + (scaling / 2 - 1), 2, 2);
            }
        }
    }

}

/**
 * @param blueprint {string} Raw Blueprint String
 * @returns {Blueprint} Blueprint
 * @constructor
 */
function ParseBP (blueprint) {
    const decoded = Buffer.from(blueprint.substr(1), 'base64');
    const unzipped = zlib.inflateSync(decoded).toString('utf-8');
    const json = JSON.parse(unzipped);
    return new Blueprint(json);
}


function LoadData (data) {
    const parsed = {};
    for (let category in data) {
        for (let entity in data[category]) {
            parsed[entity] = data[category][entity]
        }
    }
    gameData = parsed;
}

const cache = {};
const required = {};

function cachedRenderer (entity, grid, imageResolver, shadow) {
    if (required[entity.name] === undefined) {
        required[entity.name] = require(__dirname + "/renderers/" + renderers[entity.name])
    }

    const renderer = required[entity.name];

    let key = entity.name + "_" + renderer.getKey(entity, grid);

    if (shadow) {
        key += "_shadow";
    }

    if (cache[key] === undefined) {
        cache[key] = (shadow ? renderer.renderShadow(entity, grid, imageResolver) : renderer.render(entity, grid, imageResolver)) || null
    }

    return cache[key];
}

module.exports = {
    LoadData,
    ParseBP
};