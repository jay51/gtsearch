const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const accepts = require("accepts");
const webSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");

const db = require("./db");
const utils = require("./utils");
const handleWs = require("./ws");


/* check if token is valide */
function handleCheckToken(req, res) {
    const header = req.headers["authorization"];
    let error = null;
    let token = null;
    if (header) {
        token = header.split(" ")[1];
        try {
            jwt.verify(token, "secret");
        } catch(e) {
            // console.error(e);
            error = "Not Authenticated";
        }
    }
    res.end(JSON.stringify({error, token}));
    return;
}


/*
 * register user and send jwt with user info
 */
function handleSignup(req, res) {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const json = JSON.parse(body);
            console.log("Signup: ", json);
            res.setHeader("Content-Type", "application/json");

            if (!json.username || !json.email || !json.password) {
                throw new Error("missing fields");
            }

            json.password = utils.hashPassword(json.password);
            await db.addUser(json)
            const user = await db.getUser(json.email);
            if (user) {
                const payload = {
                    // 1 houre
                    "exp": Math.floor(Date.now() / 1000) + (60 * 60),
                    "addr": "may be store ip os wss",
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                    "id": user.id
                };

                const token = jwt.sign(payload, "secret");;
                res.end(JSON.stringify({token, error: null}));
                return;
            }

        } catch (e) {
            res.end(JSON.stringify({error: "invalide data"}));
            console.error(e.message);
        }
    });
}

/*
 * authenticate user and send jwt with user info
 */
function handleLogin(req, res) {
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const json = JSON.parse(body);
            console.log("Login: ", json);
            res.setHeader("Content-Type", "application/json");

            let result = {error: "email or password not found"};
            const user = await db.getUser(json.email)
            if (user && utils.comparePassword(json.password, user.password)) {
                const payload = {
                    // 1 houre
                    "exp": Math.floor(Date.now() / 1000) + (60 * 60),
                    "addr": "may be store ip os wss",
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                    "id": user.id
                };
                result.token = jwt.sign(payload, "secret");;
                result.error = null;
            }

            res.end(JSON.stringify(result));
            return;
        } catch (e) {
            console.error(e.message);
        }
    });
}

/*
 * returns static files from build dir
 * or returns index.html from build dir
 *
 * @return stream  file stream
 */
function handleRequest(req, res) {
    const {path: urlPath} = url.parse(req.url, true);
    if (req.method == "POST" && urlPath.startsWith("/login")) {
        return handleLogin(req, res);
    }

    if (req.method == "POST" && urlPath.startsWith("/signup")) {
        return handleSignup(req, res);
    }

    if (req.method == "POST" && urlPath.startsWith("/refresh")) {
        return handleCheckToken(req, res);
    }

    if (urlPath.startsWith("/static")) {
        // console.log(urlPath);
        // fileName = urlPath.slice("/static/".length)
        // const stream = fs.createReadStream(path.join(__dirname, "demo", "build", urlPath));
        const stream = fs.createReadStream(path.join(__dirname, "..", "..", "client", "build", urlPath));
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
    // return fs.createReadStream(path.join(__dirname, "demo", "build", "index.html"));
    return fs.createReadStream(path.join(__dirname, "..", "..", "client", "build", "index.html"));
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
    /*
    const admin = await db.getUser("admin@example.com")
    // console.log("Admin user: ", admin);
    const repo = {
        name: "test2 repo",
        webUrl: "https://github.com/test/test",
        gitUrl: "https://github.com/test/test.git",
        cloned: 1,
        fetchFailed: 0,
        branch: "master",
        user_id: 1
    };
    await db.addRepo(repo);
    const repos = await db.getUserRepos(admin.id);
    console.log("Repo: ", repos);
    */


    const server = http.createServer((req, res) => {
        let stream = handleRequest(req, res);
        // NOTE: if we don't return a stream that means we called res.end instead
        // calling res.setHeader will break if we've already called res.end.
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
    }).listen(8080, "localhost");

    const wss = new webSocket.Server({server});
    // to test this type this in your browser console (const ws = new WebSocket("ws://localhost:3000"))
    // when we get a connection we get back a socket, then we listen on that socket for a message
    wss.on("connection", (ws, req) => {
        console.log("we got a connection")
        handleWs(ws, req)
    });
}

main()
