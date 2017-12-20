function getSize (entity) {
    switch (entity.direction || 0) {
        default:
            return [9, 4.5];
        case 0:
        case 1:
        case 4:
        case 5:
            return [5, 9];
    }
}

module.exports = {
    getSize
};