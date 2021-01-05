const Schema = require("validate");

const repo = new Schema({
    name: {
        type: String,
        required: true,
        match:/[a-zA-Z0-9-_]+/,
        length: {min: 1, max: 38}
    },
    gitUrl: {
        type: String,
        required: true,
        length: {min: 18, max: 52}
    },
    branch: {
        type: String,
        required: true,
        match:/[a-zA-Z0-9-_]+/,
        length: {min: 1, max: 38}
    }
});


const user = new Schema({
    username: {
        type: String,
        required: true,
        match:/[a-zA-Z0-9-_]+/,
        length: {min: 1, max: 38}
    },
    email: {
        type: String,
        required: true,
        length: {min: 1, max: 38}
    },
    password: {
        type: String,
        required: true,
        length: {min: 1, max: 38}
    },
});

const searchQuery = new Schema({
    repoId: {
        type: Number,
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    excludeDir: {
        type: Array,
        each: {type: String}
    },
    excludeFile: {
        type: Array,
        each: {type: String}
    },
    ignoreCase: {
        type: Boolean,
    }
});

module.exports = {
    repo,
    user,
    searchQuery,
}

