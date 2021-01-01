const bcrypt = require('bcrypt');
const path = require("path");

function hashPassword(password) {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}

function comparePassword(password, hash) {
    const saltRounds = 10;
    const match = bcrypt.compareSync(password, hash);
    return match;
}


/* @return path to repo on disk */
function getPath(name, base=null) {
    let basePath;
    if (base) {
        basePath = path.join(__dirname, ...arguments);
    }

    basePath = path.join(__dirname, '..', 'var', "clones");
    const result = path.join(basePath, name);
    console.log("getpath: ", result);
    return result;
}

module.exports = {
    hashPassword,
    comparePassword,
    getPath,
}
