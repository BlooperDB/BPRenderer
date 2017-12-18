const {createCanvas, Image} = require('canvas');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync("data.json").toString("utf-8"))['raw'];

const directions = ['north', 'east', 'south', 'west'];

function getFile (path) {
    return fs.readFileSync("factorio/data/" + path.replace(/__/g, ""));
}

function saveCanvas (path, canvas) {
    const out = fs.createWriteStream(path);
    const stream = canvas.pngStream();

    stream.on('data', function (chunk) {
        out.write(chunk);
    });

    stream.on('end', function () {
        // Need this otherwise Node kills threads
    });
}

function combineCanvas (first, second) {
    const canvas = createCanvas(Math.max(first.width, second.width), Math.max(first.height, second.height));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(first, Math.floor(canvas.width / 2 - first.width / 2), Math.floor(canvas.height / 2 - first.height / 2));
    ctx.drawImage(second, Math.floor(canvas.width / 2 - second.width / 2), Math.floor(canvas.height / 2 - second.height / 2));
    return canvas;
}

function rotateCanvas (canvas, degrees) {
    const newCanvas = createCanvas(canvas.width, canvas.height);
    const ctx = newCanvas.getContext("2d");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(canvas, (canvas.width / 2) * -1, (canvas.height / 2) * -1);
    return newCanvas;
}

function extendCanvas (canvas, up, right, down, left) {
    const newCanvas = createCanvas(canvas.width + (right || 0) + (left || 0), canvas.height + (up || 0) + (down || 0));
    const ctx = newCanvas.getContext("2d");
    ctx.drawImage(canvas, left || 0, up || 0);
    return newCanvas;
}

function getImage (path) {
    const file = getFile(path);

    const image = new Image();
    image.src = file;

    return image
}

function cropImage (image, x, y, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return canvas;
}

function processPicture (picture, xOffset, yOffset, widthX, heightY) {
    if (picture.apply_runtime_tint !== undefined || picture.filenames !== undefined) {
        return undefined
    }

    const file = getFile(picture.filename);

    const image = new Image();
    image.src = file;

    const width = widthX || picture.width;
    const height = heightY || picture.height;

    let centerX = width / 2;
    let centerY = height / 2;

    if (picture.shift !== undefined) {
        centerX = Math.round(Math.abs((picture.shift[0] - width / 64) * 32));
        centerY = Math.round(Math.abs((picture.shift[1] - height / 64) * 32));
    }

    let canvasWidth = width + Math.abs((width / 2) - centerX);
    let canvasHeight = height + Math.abs((height / 2) - centerY);

    const currentDeltaX = Math.round(canvasWidth / 2) - centerX;
    const currentDeltaY = Math.round(canvasHeight / 2) - centerY;

    if (picture.filename.indexOf("door-front") >= 0) {
        console.log(currentDeltaX + width, currentDeltaY + height, canvasWidth, canvasHeight)
    }

    if (currentDeltaX < 0) {
        canvasWidth += Math.abs(currentDeltaX) * 2;
    } else if (currentDeltaX + width > canvasWidth) {
        canvasWidth += (currentDeltaX + width) - canvasWidth
    }

    if (currentDeltaY < 0) {
        canvasHeight += Math.abs(currentDeltaY) * 2;
    } else if (currentDeltaY + height > canvasHeight) {
        canvasHeight += (currentDeltaY + height) - canvasHeight
    }

    if (picture.filename.indexOf("door-front") >= 0) {
        console.log(currentDeltaX + width, currentDeltaY + height, canvasWidth, canvasHeight)
    }

    const canvas = createCanvas(canvasWidth, canvasHeight);

    const deltaX = Math.round(canvasWidth / 2) - centerX;
    const deltaY = Math.round(canvasHeight / 2) - centerY;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, xOffset || picture.x || 0, yOffset || picture.y || 0, width, height, deltaX, deltaY, width, height);
    return canvas;
}

function extractFromPicture (name, picture, suffix) {
    suffix = suffix || "";

    if (picture === undefined) {
        console.log("Skipping (no data):", name, suffix);
        return
    }

    if (picture.filename !== undefined) {
        let result = name;

        if (suffix !== undefined) {
            result = result + suffix;
        }

        if (picture.draw_as_shadow) {
            result = result + "_shadow";
        }

        const canvas = processPicture(picture);

        if (canvas === undefined) {
            return
        }

        const out = saveCanvas("images/" + result + ".png", canvas);
    } else if (picture.north !== undefined) {
        for (let i in directions) {
            extractFromPicture(name, picture[directions[i]], suffix + "_" + directions[i]);
        }
    } else if (picture.layers !== undefined) {
        if (picture.layers.length === 2 && picture.layers[1].draw_as_shadow !== undefined) {
            extractFromPicture(name, picture.layers[0], suffix);
            extractFromPicture(name, picture.layers[1], suffix);
        } else {
            for (let i in picture.layers) {
                extractFromPicture(name, picture.layers[i], suffix + "_" + i);
            }
        }
    } else {
        for (let i in picture) {
            if (i === "sheet") {
                extractFromPicture(name, picture[i], suffix);
            } else {
                extractFromPicture(name, picture[i], suffix + "_" + i);
            }
        }
    }
}

function noop (entity, data) {
    console.log("TODO:", entity)
}

function transportBelt (entity, data) {
    saveCanvas("images/" + entity + "_horizontal.png", processPicture(data.animations));
    saveCanvas("images/" + entity + "_vertical.png", processPicture(data.animations, 0, 1 * data.animations.height));
    saveCanvas("images/" + entity + "_bend_right.png", processPicture(data.animations, 0, 8 * data.animations.height));
    saveCanvas("images/" + entity + "_bend_left.png", processPicture(data.animations, 0, 9 * data.animations.height));
}

function undergroundBelt (entity, data) {
    let o = data.structure.direction_out;
    saveCanvas("images/" + entity + "_out_down.png", combineCanvas(
        extendCanvas(rotateCanvas(processPicture(data.belt_vertical, 0, 40, 40, 20), 180), 20, 0, 0, 1),
        processPicture(o.sheet)));

    saveCanvas("images/" + entity + "_out_left.png", combineCanvas(
        processPicture(data.belt_horizontal),
        processPicture(o.sheet, 1 * o.sheet.width, 0)));

    saveCanvas("images/" + entity + "_out_up.png", combineCanvas(
        extendCanvas(processPicture(data.belt_vertical), 0, 0, 0, 1),
        processPicture(o.sheet, 2 * o.sheet.width, 0)));

    saveCanvas("images/" + entity + "_out_right.png", combineCanvas(
        extendCanvas(processPicture(data.belt_horizontal, 20, 0, 20, 0), 0, 0, 0, 21),
        processPicture(o.sheet, 3 * o.sheet.width, 0)));

    let i = data.structure.direction_in;
    saveCanvas("images/" + entity + "_in_up.png", combineCanvas(
        extendCanvas(processPicture(data.belt_vertical, 0, 60, 40, 20), 20, 0, 0, 1),
        processPicture(i.sheet, 0, i.sheet.height)));

    saveCanvas("images/" + entity + "_in_right.png", combineCanvas(
        extendCanvas(processPicture(data.belt_horizontal, 0, 0, 19, 40), 0, 20, 0, 0),
        processPicture(i.sheet, 1 * i.sheet.width, i.sheet.height)));

    saveCanvas("images/" + entity + "_in_down.png", combineCanvas(
        extendCanvas(rotateCanvas(processPicture(data.belt_vertical), 180), 0, 0, 0, 1),
        processPicture(i.sheet, 2 * i.sheet.width, i.sheet.height)));

    saveCanvas("images/" + entity + "_in_left.png", combineCanvas(
        extendCanvas(rotateCanvas(processPicture(data.belt_horizontal, 0, 0, 20, 40), 180), 0, 0, 0, 20),
        processPicture(i.sheet, 3 * i.sheet.width, i.sheet.height)));
}

function splitter (entity, data) {
    const s = data.structure;
    saveCanvas("images/" + entity + "_north.png", combineCanvas(
        combineCanvas(
            extendCanvas(processPicture(data.belt_vertical), 0, 30),
            extendCanvas(processPicture(data.belt_vertical), 0, 0, 0, 30)),
        processPicture(s.north)));

    saveCanvas("images/" + entity + "_east.png", combineCanvas(
        combineCanvas(
            extendCanvas(processPicture(data.belt_horizontal), 34),
            extendCanvas(processPicture(data.belt_horizontal), 0, 0, 34)),
        processPicture(s.east)));

    saveCanvas("images/" + entity + "_south.png", combineCanvas(
        combineCanvas(
            extendCanvas(rotateCanvas(processPicture(data.belt_vertical), 180), 0, 32),
            extendCanvas(rotateCanvas(processPicture(data.belt_vertical), 180), 0, 0, 0, 32)),
        processPicture(s.south)));

    saveCanvas("images/" + entity + "_west.png", combineCanvas(
        combineCanvas(
            extendCanvas(rotateCanvas(processPicture(data.belt_horizontal), 180), 34),
            extendCanvas(rotateCanvas(processPicture(data.belt_horizontal), 180), 0, 0, 34)),
        processPicture(s.west)));
}

function inserter (entity, data) {
    saveCanvas("images/" + entity + "_north.png", combineCanvas(
        processPicture(data.platform_picture.sheet),
        extendCanvas(processPicture(data.hand_open_picture), 0, 0, 40, 2)));

    saveCanvas("images/" + entity + "_east.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 3 * data.platform_picture.sheet.width),
        combineCanvas(
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_base_picture), 15, 15, 15, 15), 35), 0, 0, 20, 10),
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_open_picture), 15, 15, 15, 15), 145), 0, 0, 15, 45))));

    saveCanvas("images/" + entity + "_south.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 2 * data.platform_picture.sheet.width),
        extendCanvas(rotateCanvas(processPicture(data.hand_open_picture), 180), 32, 0, 0, 2)));

    saveCanvas("images/" + entity + "_west.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 1 * data.platform_picture.sheet.width),
        combineCanvas(
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_base_picture), 15, 15, 15, 15), -35), 0, 15, 20, 0),
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_open_picture), 15, 15, 15, 15), -145), 0, 50, 15, 0))));
}

function longHandedInserter (entity, data) {
    saveCanvas("images/" + entity + "_north.png", combineCanvas(
        processPicture(data.platform_picture.sheet),
        combineCanvas(
            extendCanvas(processPicture(data.hand_open_picture), 0, 0, 90, 2),
            extendCanvas(processPicture(data.hand_base_picture), 0, 0, 30, 3))));

    saveCanvas("images/" + entity + "_east.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 3 * data.platform_picture.sheet.width),
        combineCanvas(
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_base_picture), 15, 15, 15, 15), 75), 0, 0, 20, 20),
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_open_picture), 15, 15, 15, 15), 115), 0, 0, 15, 85))));

    saveCanvas("images/" + entity + "_south.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 2 * data.platform_picture.sheet.width),
        combineCanvas(
            extendCanvas(rotateCanvas(processPicture(data.hand_open_picture), 180), 85, 0, 0, 2),
            extendCanvas(rotateCanvas(processPicture(data.hand_base_picture), 180), 25, 0, 0, 3))));

    saveCanvas("images/" + entity + "_west.png", combineCanvas(
        processPicture(data.platform_picture.sheet, 1 * data.platform_picture.sheet.width),
        combineCanvas(
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_base_picture), 15, 15, 15, 15), -75), 0, 15, 20, 0),
            extendCanvas(rotateCanvas(extendCanvas(processPicture(data.hand_open_picture), 15, 15, 15, 15), -115), 0, 85, 15, 0))));
}

function combinatorDisplays () {
    const grid = [
        ["empty", "plus", "minus", "multiply", "divide", "modulo"],
        ["power", "left_shift", "right_shift", "and", "or", "xor"],
        ["gt", "lt", "eq", "neq", "lte", "gte"]
    ];

    const width = 15;
    const height = 11;

    const image = new Image();
    image.src = getFile("base/graphics/entity/combinator/combinator-displays.png");

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, x * width, y * height, width, height, 0, 0, width, height);
            saveCanvas("images/display_" + grid[y][x] + ".png", canvas);
        }
    }
}

function roboport (entity, data) {
    saveCanvas("images/roboport.png", combineCanvas(
        processPicture(data.base),
        combineCanvas(
            processPicture(data.base_patch),
            combineCanvas(
                processPicture(data.door_animation_up),
                combineCanvas(
                    processPicture(data.door_animation_down),
                    processPicture(data.base_animation))))));
}

function heatPipe (entity, data) {
    saveCanvas("images/" + entity + "_single.png", processPicture(data.connection_sprites.single[0]));
    saveCanvas("images/" + entity + "_straight_horizontal.png", processPicture(data.connection_sprites.straight_horizontal[0]));
    saveCanvas("images/" + entity + "_ending_right.png", processPicture(data.connection_sprites.ending_right[0]));
    saveCanvas("images/" + entity + "_corner_right_up.png", processPicture(data.connection_sprites.corner_right_up[0]));
    saveCanvas("images/" + entity + "_t_left.png", processPicture(data.connection_sprites.t_left[0]));
    saveCanvas("images/" + entity + "_t_down.png", processPicture(data.connection_sprites.t_down[0]));
    saveCanvas("images/" + entity + "_ending_up.png", processPicture(data.connection_sprites.ending_up[0]));
    saveCanvas("images/" + entity + "_t_right.png", processPicture(data.connection_sprites.t_right[0]));
    saveCanvas("images/" + entity + "_t_up.png", processPicture(data.connection_sprites.t_up[0]));
    saveCanvas("images/" + entity + "_ending_left.png", processPicture(data.connection_sprites.ending_left[0]));
    saveCanvas("images/" + entity + "_ending_down.png", processPicture(data.connection_sprites.ending_down[0]));
    saveCanvas("images/" + entity + "_straight_vertical.png", processPicture(data.connection_sprites.straight_vertical[0]));
    saveCanvas("images/" + entity + "_corner_right_down.png", processPicture(data.connection_sprites.corner_right_down[0]));
    saveCanvas("images/" + entity + "_cross.png", processPicture(data.connection_sprites.cross[0]));
    saveCanvas("images/" + entity + "_corner_left_down.png", processPicture(data.connection_sprites.corner_left_down[0]));
    saveCanvas("images/" + entity + "_corner_left_up.png", processPicture(data.connection_sprites.corner_left_up[0]));
}

function stoneWall (entity, data) {
    saveCanvas("images/" + entity + "_single.png", processPicture(data.pictures.single.layers[0]));
    saveCanvas("images/" + entity + "_straight_horizontal.png", processPicture(data.pictures.straight_horizontal[0].layers[0]));
    saveCanvas("images/" + entity + "_ending_right.png", processPicture(data.pictures.ending_right.layers[0]));
    saveCanvas("images/" + entity + "_t_up.png", processPicture(data.pictures.t_up.layers[0]));
    saveCanvas("images/" + entity + "_ending_left.png", processPicture(data.pictures.ending_left.layers[0]));
    saveCanvas("images/" + entity + "_straight_vertical.png", processPicture(data.pictures.straight_vertical[0].layers[0]));
    saveCanvas("images/" + entity + "_corner_right_down.png", processPicture(data.pictures.corner_right_down.layers[0]));
    saveCanvas("images/" + entity + "_corner_left_down.png", processPicture(data.pictures.corner_left_down.layers[0]));

    saveCanvas("images/" + entity + "_single_shadow.png", processPicture(data.pictures.single.layers[1]));
    saveCanvas("images/" + entity + "_straight_horizontal_shadow.png", processPicture(data.pictures.straight_horizontal[0].layers[1]));
    saveCanvas("images/" + entity + "_ending_right_shadow.png", processPicture(data.pictures.ending_right.layers[1]));
    saveCanvas("images/" + entity + "_t_up_shadow.png", processPicture(data.pictures.t_up.layers[1]));
    saveCanvas("images/" + entity + "_ending_left_shadow.png", processPicture(data.pictures.ending_left.layers[1]));
    saveCanvas("images/" + entity + "_straight_vertical_shadow.png", processPicture(data.pictures.straight_vertical[0].layers[1]));
    saveCanvas("images/" + entity + "_corner_right_down_shadow.png", processPicture(data.pictures.corner_right_down.layers[1]));
    saveCanvas("images/" + entity + "_corner_left_down_shadow.png", processPicture(data.pictures.corner_left_down.layers[1]));
}

function assemblingMachine (entity, data) {
    saveCanvas("images/" + entity + ".png", processPicture(data.animation.layers[0]));
    saveCanvas("images/" + entity + "_shadow.png", processPicture(data.animation.layers[1]));

    saveCanvas("images/" + entity + "_pipe_north.png", extendCanvas(getImage("base/graphics/entity/" + entity + "/" + entity + "-pipe-N.png"), 0, 0, 100, 5));
    saveCanvas("images/" + entity + "_pipe_east.png", extendCanvas(getImage("base/graphics/entity/" + entity + "/" + entity + "-pipe-E.png"), 0, 0, 0, 80));
    saveCanvas("images/" + entity + "_pipe_south.png", extendCanvas(getImage("base/graphics/entity/" + entity + "/" + entity + "-pipe-S.png"), 70, 0, 0, 0));
    saveCanvas("images/" + entity + "_pipe_west.png", extendCanvas(getImage("base/graphics/entity/" + entity + "/" + entity + "-pipe-W.png"), 0, 77, 0, 0));
}

function rocketSilo (entity, data) {
    saveCanvas("images/" + entity + ".png", combineCanvas(
        combineCanvas(
            processPicture(data.door_back_sprite),
            extendCanvas(getImage(data.door_front_sprite.filename), 130, 0, 0, 0)),
        processPicture(data.base_day_sprite)));

    saveCanvas("images/" + entity + "_shadow.png", processPicture(data.shadow_sprite));
}

function nuclearReactor (entity, data) {
    saveCanvas("images/" + entity + ".png", combineCanvas(
        processPicture(data.lower_layer_picture),
        processPicture(data.picture.layers[0])
    ));

    saveCanvas("images/" + entity + "_shadow.png", processPicture(data.picture.layers[1]));
}

function storageTank (entity, data) {
    saveCanvas("images/" + entity + "_north.png", processPicture(data.pictures.picture.sheet));
    saveCanvas("images/" + entity + "_east.png", processPicture(data.pictures.picture.sheet, data.pictures.picture.sheet.width));
}

function beacon (entity, data) {
    saveCanvas("images/" + entity + ".png", combineCanvas(
        processPicture(data.base_picture),
        processPicture(data.animation)))
}

function centrifuge (entity, data) {
    saveCanvas("images/" + entity + ".png", combineCanvas(
        processPicture(data.idle_animation.layers[0]),
        combineCanvas(
            processPicture(data.idle_animation.layers[2]),
            processPicture(data.idle_animation.layers[4]))));

    saveCanvas("images/" + entity + "_shadow.png", combineCanvas(
        processPicture(data.idle_animation.layers[1]),
        combineCanvas(
            processPicture(data.idle_animation.layers[3]),
            processPicture(data.idle_animation.layers[5]))));
}

function flamethrowerTurret (entity, data) {
    saveCanvas("images/" + entity + "_north.png", combineCanvas(
        extendCanvas(processPicture(data.fluid_box.pipe_picture.east), 64, 0, 0, 32),
        combineCanvas(
            extendCanvas(processPicture(data.fluid_box.pipe_picture.west), 64, 32, 0, 0),
            combineCanvas(
                processPicture(data.base_picture.north.layers[0]),
                processPicture(data.folded_animation.north.layers[0])))));

    saveCanvas("images/" + entity + "_east.png", combineCanvas(
        extendCanvas(processPicture(data.fluid_box.pipe_picture.north), 0, 64, 32, 0),
        combineCanvas(
            extendCanvas(processPicture(data.fluid_box.pipe_picture.south), 32, 64, 0, 0),
            combineCanvas(
                processPicture(data.base_picture.east.layers[0]),
                processPicture(data.folded_animation.east.layers[0])))));

    saveCanvas("images/" + entity + "_south.png", combineCanvas(
        extendCanvas(processPicture(data.fluid_box.pipe_picture.east), 0, 0, 64, 32),
        combineCanvas(
            extendCanvas(processPicture(data.fluid_box.pipe_picture.west), 0, 32, 64, 0),
            combineCanvas(
                processPicture(data.base_picture.south.layers[0]),
                processPicture(data.folded_animation.south.layers[0])))));

    saveCanvas("images/" + entity + "_west.png", combineCanvas(
        extendCanvas(processPicture(data.fluid_box.pipe_picture.north), 0, 0, 32, 64),
        combineCanvas(
            extendCanvas(processPicture(data.fluid_box.pipe_picture.south), 32, 0, 0, 64),
            combineCanvas(
                processPicture(data.base_picture.west.layers[0]),
                processPicture(data.folded_animation.west.layers[0])))));

    saveCanvas("images/" + entity + "_north_shadow.png", combineCanvas(
        processPicture(data.base_picture.north.layers[2]),
        processPicture(data.folded_animation.north.layers[2])));

    saveCanvas("images/" + entity + "_east_shadow.png", combineCanvas(
        processPicture(data.base_picture.east.layers[2]),
        processPicture(data.folded_animation.east.layers[2])));

    saveCanvas("images/" + entity + "_south_shadow.png", combineCanvas(
        processPicture(data.base_picture.south.layers[2]),
        processPicture(data.folded_animation.south.layers[2])));

    saveCanvas("images/" + entity + "_west_shadow.png", combineCanvas(
        processPicture(data.base_picture.west.layers[2]),
        processPicture(data.folded_animation.west.layers[2])));
}

const special = {
    "curved-rail": noop,
    "straight-rail": noop,
    "beacon": beacon,
    "centrifuge": centrifuge,
    "pumpjack": noop,
    "rocket-silo": rocketSilo,
    "underground-belt": undergroundBelt,
    "fast-underground-belt": undergroundBelt,
    "express-underground-belt": undergroundBelt,
    "transport-belt": transportBelt,
    "fast-transport-belt": transportBelt,
    "express-transport-belt": transportBelt,
    "splitter": splitter,
    "fast-splitter": splitter,
    "express-splitter": splitter,
    "inserter": inserter,
    "stack-inserter": inserter,
    "filter-inserter": inserter,
    "burner-inserter": inserter,
    "fast-inserter": inserter,
    "stack-filter-inserter": inserter,
    "long-handed-inserter": longHandedInserter,
    "roboport": roboport,
    "heat-pipe": heatPipe,
    "stone-wall": stoneWall,
    "nuclear-reactor": nuclearReactor,
    "assembling-machine-2": assemblingMachine,
    "assembling-machine-3": assemblingMachine,
    "storage-tank": storageTank,
    "flamethrower-turret": flamethrowerTurret
};

for (let category in data) {

    if (category === "technology"
        || category === "item-subgroup"
        || category === "tutorial"
        || category === "simple-entity"
        || category === "unit"
        || category === "simple-entity-with-force"
        || category === "rail-remnants"
        || category.endsWith("achievement")) {
        continue
    }

    for (let entity in data[category]) {
        const e = data[category][entity];

        if (e.flags !== undefined && e.flags.length > 0 && e.flags.indexOf("hidden") >= 0) {
            continue
        }

        if (e.icon !== undefined) {
            const image = new Image();
            image.src = getFile(e.icon);
            const canvas = createCanvas(image.width, image.height);
            canvas.getContext("2d").drawImage(image, 0, 0);
            saveCanvas("images/icon_" + entity + ".png", canvas);
        }

        if (category === "recipe" || category === "item") {
            continue
        }

        try {
            if (special[entity] !== undefined) {
                special[entity](entity, e);
                continue
            }

            if (e.flags === undefined || (e.flags.length > 0 && (e.flags.indexOf("player-creation") < 0 || e.flags.indexOf("placeable-off-grid") >= 0))) {
                continue
            }

            // TODO Generate spritesheet for frontend
            if (e.picture !== undefined) {
                const picture = extractFromPicture(entity, e.picture);
            } else if (e.pictures !== undefined) {
                const picture = extractFromPicture(entity, e.pictures);
            } else if (e.idle_animation !== undefined) {
                const picture = extractFromPicture(entity, e.idle_animation);
            } else if (e.animation !== undefined) {
                const picture = extractFromPicture(entity, e.animation);
            } else if (e.animations !== undefined) {
                const picture = extractFromPicture(entity, e.animations);
            } else if (e.structure !== undefined) {
                const picture = extractFromPicture(entity, e.structure);
            } else if (e.off_animation !== undefined) {
                const picture = extractFromPicture(entity, e.off_animation);
            } else if (e.vertical_animation !== undefined && e.horizontal_animation !== undefined) {
                const picture = extractFromPicture(entity, e.vertical_animation, "_vertical");
                const picture2 = extractFromPicture(entity, e.horizontal_animation, "_horizontal");
            } else if (e.picture_off !== undefined) {
                const picture = extractFromPicture(entity, e.picture_off);
            } else if (e.power_on_animation !== undefined) {
                const picture = extractFromPicture(entity, e.power_on_animation);
            } else if (e.sprite !== undefined) {
                const picture = extractFromPicture(entity, e.sprite);
            } else if (e.sprites !== undefined) {
                const picture = extractFromPicture(entity, e.sprites);
            } else if (e.connection_sprites !== undefined) {
                const picture = extractFromPicture(entity, e.connection_sprites);
            } else {
                console.log("TODO:", entity);
            }
        } catch (err) {
            console.log(err);
        }
    }
}

combinatorDisplays();
