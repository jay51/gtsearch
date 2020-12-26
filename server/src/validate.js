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

module.exports = {
    repo,
    user,
}

// const myobj = {
  // username: "jack",
  // gitUrl: "https://github.com/jay51/flask-course",
// };

// const errors = repo.validate(myobj);
// for (const err of errors) {
    // console.log(err.path);
    // console.log(err.message);
// }
