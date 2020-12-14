const http = require("http");
const url = require("url");
const fs = require("fs");
const zlib = require("zlib");
const accepts = require("accepts");
const webSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const jwt = require('jsonwebtoken');

const db = require("./db");
const utils = require("./utils");

function handleLogin(req, res) {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const json = JSON.parse(body);
            const driver = db.getDB();
            console.log(json);
            res.setHeader("Content-Type", "application/json");

            let result = {error: "email or password not found"};
            const user = await driver.getUser(json.email)
            if (user && utils.comparePassword(json.password, user.password)) {
                const payload = {
                    // 1 houre
                    "exp": Math.floor(Date.now() / 1000) + (60 * 60),
                    "addr": "may be store ip os wss",
                    "email": user.email,
                    "username": user.username,
                    "role": user.role
                };
                const token = jwt.sign(payload, "secret");
                result = token;
            }

            return res.end(JSON.stringify(result));
        } catch (e) {
            console.error(e.message);
        }
    });
}

/*
 * returns static files from build dir
 * or returns index.html from build dir
 *
 */
function handleRequest(req, res) {
    const {path: urlPath} = url.parse(req.url, true);
    if (req.method == "POST" && urlPath.startsWith("/login")) {
        return handleLogin(req, res);
    }
    if (urlPath.startsWith("/static")) {
        // console.log(urlPath);
        // fileName = urlPath.slice("/static/".length)
        const stream = fs.createReadStream(path.join(__dirname, "demo", "build", urlPath));
        if (!stream) {
            res.statusCode = 404;
            res.end("not found");
        } else {
            const type = urlPath.endsWith(".css") ? "text/css" :
                urlPath.endsWith(".js") ? "application/javascript" : null;
            res.setHeader("Content-Type", type);
        }
        return stream;
    }

    res.setHeader("Content-Type", "text/html");
    return fs.createReadStream(path.join(__dirname, "demo", "build", "index.html"));
}

// Returns [name, stream] or null
function getCompressionStream(req) {
    switch (accepts(req).encoding(["gzip", "deflate"])) {
        case "gzip":
            return ["gzip", zlib.createGzip()];

        case "deflate":
            return ["deflate", zlib.createDeflate()];
    }

    return null;
}

// main Server and websockets setup
async function main() {
    const driver = db.getDB();

    // const admin = await driver.getUser("admin@example.com")
    // console.log("Admin user: ", admin);
    /*
    const repo = {
        name: "test2 repo",
        webUrl: "https://github.com/test/test",
        gitUrl: "https://github.com/test/test.git",
        cloned: 1,
        fetchFailed: 0,
        branch: "master",
        user_id: 1
    };
    */
    // await driver.addRepo(repo);
    // const repos = await driver.getUserRepos(admin.id);
    // console.log("Repo: ", repos);


    const server = http.createServer((req, res) => {
        let stream = handleRequest(req, res);
        if (!stream) return;

        const compression = getCompressionStream(req);
        if (compression) {
            const [name, compressor] = compression;
            res.setHeader("Content-Encoding", name);
            compressor.on("error", console.error);
            stream = stream.pipe(compressor);
        }

        stream.on("error", console.error);
        return stream.pipe(res);
    }).listen(8080);

    // console.log("what is this ", server);
    const wss = new webSocket.Server({server}, ()=> console.log("this is my callback"));
    // to test this type this in your browser console (const ws = new WebSocket("ws://localhost:3000"))
    wss.on("connection", (ws, req) => {
        ws.on("message", msg => {
            console.log("got a message: ", msg);
        });
    });
}

main()
