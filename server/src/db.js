const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const {promisify} = require("util")

const utils = require("./utils");


// Singleton class
class Driver {
    constructor() {
        if (Driver.instance instanceof Driver) {
            return Driver.instance;
        }

        this.filePath = path.join(__dirname, "..", "var", "gtsearch.sqlitedb");
        this.DB = new sqlite3.Database(this.filePath);
        this.run = promisify(this.DB.run.bind(this.DB));
        this.all = promisify(this.DB.all.bind(this.DB));
        this.get = promisify(this.DB.get.bind(this.DB));
        this.exec = promisify(this.DB.exec.bind(this.DB));
        this.close = promisify(this.DB.close.bind(this.DB));
        this.serialize = promisify(this.DB.serialize.bind(this.DB));

        Object.freeze(this);
        // static var
        Driver.instance = this;
        this.createDB();
    }

    async getUser(email) {
        const admin = await this.get(`SELECT * FROM users WHERE email = (?);`, email);
        return admin;
    }

    createDB() {
        this.serialize(function() {
            this.run(
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role INTEGER DEFAULT 1,
                    username TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password TEXT NOT NULL
                );`
            );

            this.run(
                `CREATE TABLE IF NOT EXISTS repos (
                    name TEXT NOT NULL PRIMARY KEY,
                    gitUrl TEXT NOT NULL,
                    cloned INTEGER,
                    fetchFailed INTEGER,
                    branch TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );`
            );

            const admin = ["admin", "admin@example.com", 0, utils.hashPassword("admin")];
            const placeholders = admin.map(col => "?").join(",");
            this.run(
                `INSERT INTO users (username, email, role, password) VALUES (?, ?, ?, ?);`,
                admin
            );
        });
    }

    async addRepo({name, gitUrl, branch, user_id}) {
        try {
            return await this.run(
                `INSERT INTO repos (name, gitUrl, branch, user_id)
                VALUES (?, ?, ?, ?);
                );`, [name, gitUrl, branch, user_id]
            );
        } catch(e) {
            // repo with that name already exist
            console.error(e);
            return null;
        }
    }

    async getUserRepos(user_id) {
        // `Select * from repos join users on users.id = (?);`, user_id
        return await this.all(
            `SELECT * FROM repos WHERE user_id = (?);`, user_id
        );
    }
}


module.exports = new Driver();
