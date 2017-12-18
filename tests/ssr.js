const {LoadData, ParseBP} = require('../factorio');
const {createCanvas, Image} = require('canvas');
const fs = require('fs');

LoadData(JSON.parse(fs.readFileSync("data.json").toString("utf-8")));

const blueprint = fs.readFileSync("sample_blueprint.txt").toString("utf-8");

const imageCache = {};

function imageResolver (name, shadow) {
    let filename = name;

    if (shadow) {
        filename += "_shadow"
    }

    if (imageCache[filename] !== undefined) {
        return imageCache[filename];
    }

    if (!fs.existsSync("images/" + filename + ".png")) {
        return
    }

    const image = new Image();
    image.src = fs.readFileSync("images/" + filename + ".png");

    imageCache[filename] = image;

    return image;
}

function render (bp) {
    const size = bp.getSize();

    const scaling = 32;
    const canvas = createCanvas((size.width + 2) * scaling, (size.height + 2) * scaling);

    bp.render(canvas, imageResolver);
    return canvas
}

const bp = ParseBP(blueprint);

let rendered = render(bp);
fs.writeFileSync("ssr.html", '<img src="' + rendered.toDataURL() + '" /><textarea>' + JSON.stringify(bp.entities) + '</textarea>');

const out = fs.createWriteStream("sample.png");
const stream = rendered.pngStream();

stream.on('data', function (chunk) {
    out.write(chunk);
});

/*
const loops = 50;
const start = (new Date()).getTime();
for (let i = 0; i < loops; i++) {
    render(bp)
}
const taken = (new Date()).getTime() - start;

console.log();
console.log("Time taken:", taken + "ms", "AVG:", (taken / loops) + "ms");
*/