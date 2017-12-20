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
    "electric-mining-drill": "electric-mining-drill",
    "offshore-pump": "offshore-pump",
    "burner-mining-drill": "burner-mining-drill",
    "flamethrower-turret": "flamethrower-turret",
    "straight-rail": "straight-rail",
    "curved-rail": "curved-rail"
};

let gameData = null;
let gameRecipes = null;

class Blueprint {

    constructor (data) {
        if (gameData == null) {
            throw "Game data not loaded!"
        }

        this.icons = data['blueprint']['icons'];
        this.entities = data['blueprint']['entities'];
        this.grid = entitiesToGrid(this.entities);
        this.entities.sort(function (a, b) {
            /*
            if (a.name.endsWith("transport-belt") || a.name.endsWith("splitter")) {
                return -1;
            } else if (b.name.endsWith("transport-belt") || b.name.endsWith("splitter")) {
                return 1;
            }

            if (a.name === "pipe" || a.name === "pipe-to-ground") {
                return -1;
            } else if (b.name === "pipe" || b.name === "pipe-to-ground") {
                return 1;
            }

            if (a.name.endsWith("electric-pole") || a.name.endsWith("substation")) {
                return 1;
            } else if (b.name.endsWith("electric-pole") || b.name.endsWith("substation")) {
                return -1;
            }
            */

            if (a.name.endsWith("inserter")) {
                return 1;
            } else if (b.name.endsWith("inserter")) {
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
            const size = getSize(this.entities[i]);
            minWidth = Math.min(minWidth, position['x'] - size[0] / 2);
            minHeight = Math.min(minHeight, position['y'] - size[1] / 2);
            maxWidth = Math.max(maxWidth, position['x'] + size[0] / 2);
            maxHeight = Math.max(maxHeight, position['y'] + size[1] / 2);
        }

        return {
            minX: minWidth,
            minY: minHeight,
            maxX: maxWidth,
            maxY: maxHeight,
            width: Math.ceil(Math.abs(minWidth) + maxWidth),
            height: Math.ceil(Math.abs(minHeight) + maxHeight)
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
            const relativeX = position.x + Math.abs(size.minX) + 0.5;
            const relativeY = position.y + Math.abs(size.minY) + 0.5;

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

        // Second pass: rails
        for (let pass = 1; pass <= 5; pass++) {
            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];

                if (entity.name !== "straight-rail" && entity.name !== "curved-rail") {
                    continue
                }

                const position = entity['position'];
                const relativeX = position.x + Math.abs(size.minX) + 0.5;
                const relativeY = position.y + Math.abs(size.minY) + 0.5;

                const direction = entity.direction || 0;
                let image;

                if (entity.name === "straight-rail") {
                    if (direction === 0 || direction === 4) {
                        image = imageResolver(entity.name + "_vertical_pass_" + pass, false);
                    } else if (direction === 2 || direction === 6) {
                        image = imageResolver(entity.name + "_horizontal_pass_" + pass, false);
                    } else if (direction === 1) {
                        image = imageResolver(entity.name + "_diagonal_right_top_pass_" + pass, false);
                    } else if (direction === 5) {
                        image = imageResolver(entity.name + "_diagonal_left_bottom_pass_" + pass, false);
                    } else if (direction === 3) {
                        image = imageResolver(entity.name + "_diagonal_right_bottom_pass_" + pass, false);
                    } else if (direction === 7) {
                        image = imageResolver(entity.name + "_diagonal_left_top_pass_" + pass, false);
                    }
                } else {
                    if (direction === 0) {
                        image = imageResolver(entity.name + "_vertical_left_bottom_pass_" + pass, false);
                    } else if (direction === 1) {
                        image = imageResolver(entity.name + "_vertical_right_bottom_pass_" + pass, false);
                    } else if (direction === 2) {
                        image = imageResolver(entity.name + "_horizontal_left_top_pass_" + pass, false);
                    } else if (direction === 3) {
                        image = imageResolver(entity.name + "_horizontal_left_bottom_pass_" + pass, false);
                    } else if (direction === 4) {
                        image = imageResolver(entity.name + "_vertical_right_top_pass_" + pass, false);
                    } else if (direction === 5) {
                        image = imageResolver(entity.name + "_vertical_left_top_pass_" + pass, false);
                    } else if (direction === 6) {
                        image = imageResolver(entity.name + "_horizontal_right_bottom_pass_" + pass, false);
                    } else if (direction === 7) {
                        image = imageResolver(entity.name + "_horizontal_right_top_pass_" + pass, false);
                    }
                }

                if (image) {
                    const startX = Math.floor((relativeX * scaling + (scaling / 2)) - (image.width / 2));
                    const startY = Math.floor((relativeY * scaling + (scaling / 2)) - (image.height / 2));
                    ctx.drawImage(image, startX, startY, image.width, image.height)
                }
            }
        }

        // Third pass: entities
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];

            if (entity.name === "straight-rail" || entity.name === "curved-rail") {
                continue
            }

            const position = entity['position'];
            const relativeX = position.x + Math.abs(size.minX) + 0.5;
            const relativeY = position.y + Math.abs(size.minY) + 0.5;

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
    data = data['raw'];
    const parsed = {};
    const recipes = {};
    for (let category in data) {

        if (category === "technology"
            || category === "item-subgroup"
            || category === "tutorial"
            || category === "simple-entity"
            || category === "unit"
            || category === "simple-entity-with-force"
            || category === "rail-remnants"
            || category === "item-group"
            || category === "particle"
            || category === "car"
            || category === "font"
            || category === "character-corpse"
            || category === "cargo-wagon"
            || category === "ammo-category"
            || category === "ambient-sound"
            || category === "smoke"
            || category === "tree"
            || category === "corpse"
            || category.endsWith("achievement")) {
            continue
        }

        for (let entity in data[category]) {
            if (category === "recipe") {
                recipes[entity] = data[category][entity];
            } else {
                parsed[entity] = data[category][entity];
            }
        }
    }
    gameData = parsed;
    gameRecipes = recipes;
}

function getData () {
    return gameData;
}

function getRecipes () {
    return gameRecipes;
}

const required = {};

function cachedRequire (name) {
    if (required[name] === undefined && renderers[name] !== undefined) {
        required[name] = require(__dirname + "/renderers/" + renderers[name])
    }

    return required[name];
}

const cache = {};

function cachedRenderer (entity, grid, imageResolver, shadow) {
    const renderer = cachedRequire(entity.name);

    if (!renderer || !renderer.getKey) {
        return
    }

    let key = entity.name + "_" + renderer.getKey(entity, grid);

    if (shadow) {
        key += "_shadow";
    }

    if (cache[key] === undefined) {
        cache[key] = (shadow ? renderer.renderShadow(entity, grid, imageResolver) : renderer.render(entity, grid, imageResolver)) || null
    }

    return cache[key];
}

function getSize (entity) {
    const renderer = cachedRequire(entity.name);

    if (renderer && renderer.getSize) {
        return renderer.getSize(entity)
    }

    return [1, 1]
}

module.exports = {
    LoadData,
    ParseBP,
    getData,
    getRecipes,
};