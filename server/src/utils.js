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
function getPath(id, name) {
    let result = path.join(__dirname, '..', 'var', "clones", id, name);
    console.log("getpath: ", result);
    return result;
}

module.exports = {
    hashPassword,
    comparePassword,
    getPath,
}
