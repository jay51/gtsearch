const jwt = require("jsonwebtoken");

const db = require("./db");
const {repo, searchQuery} = require("./validate");
const git = require("./git");
const {Search} = require("./grep");

const events = {
    // FIXME: group into general handlers and search handlers
    "FETCH_REPOS": async (ws, payload) => {
        // FIXME: we could have a token for a user that was deleted
        // console.log("user token: ", ws.token);
        const repos = await db.getUserRepos(ws.token.id);
        ws.send(
            JSON.stringify({error: null, event: {type: "FETCH_REPOS", payload: repos}})
        );
    },
    "CLONE_REPO": async (ws, payload) => {
        console.log("Clone repo", payload);
        const errors = repo.validate(payload);
        if (errors.length) {
            // ws.send(error: errors);
            console.log("CLONE_REPO: incorrect data", errors);
        }
        await db.addRepo({...payload, user_id: ws.token.id});
        const id = ws.token.id.toString();
        await git.clone(id, payload.gitUrl, payload.name, payload.branch);
        ws.send(
            JSON.stringify({error: null, event: {type: "CLONE_REPO", payload:"success"}})
        );
    },
    "GREP_SEARCH": async (ws, payload) => {
        const errors = searchQuery.validate(payload);
        if (errors.length) {
            // ws.send(error: errors);
            console.log("GREP_SEARCH: incorrect data", errors);
        }
        const {query, excludeDir, excludeFile, ignoreCase, repoId} = payload;
        const repo = await db.getRepo(repoId, ws.token.id);
        if (!repo) {
            return ws.send(
                JSON.stringify({error: "unkown repo"})
            );
        }

        // NOTE: don't pass payload like `...payload`
        // because user can override `user_id` and access a repo that's not his.
        const task = new Search({
            ...repo,
            query,
            excludeDir,
            excludeFile,
            ignoreCase,
        });
        Search.killRunningProcesses();
        Search.runningProcesses.push(task);

        task.on("data", data => {
            console.log("got data:", data);
            if(!data.length){
                return;
            }
            ws.send(
                JSON.stringify({error: null, event: {type: "GREP_SEARCH", payload: data}})
            );
        });

        task.on("exit", code => {
            Search.runningProcesses = Search.runningProcesses.filter(t => t.query !== task.query);
            console.log("exit", Search.runningProcesses);
        });

        task.start();
    }
}

module.exports = (ws, req) => {

    /*
     * check if the socket containes and token or
     * if msg containes a token. verify and save token on the socket.
     *
     * @return true  if authenticated
     */
    const isAuthenticated = json => {
        if (ws.token) {
            return true;
        } else if (json.token) {
            try {
                // save the token on the open socket. will forget
                // token when user reload page because connection reestablish.
                ws.token = jwt.verify(json.token, "secret");
                return true;
            } catch(err) {
                return false;
            }
        }
    }

    // main socket event
    ws.on("message", async (msg) => {
        let json = null;
        try {
            json = JSON.parse(msg);
        } catch(err) {
            console.error('NOT A VALID JSON' , err);
            return false;
        }

        console.log(json)
        if (isAuthenticated(json)){
            const type = json.event.type;
            const handler = events[type];
            if (handler) {
                // FIXME: payload could be incorrect, should throw error
                try {
                    await handler(ws, json.event.payload);
                    return;
                } catch(e) {
                    console.error(e);
                    ws.send(JSON.stringify({error: e}));
                }
            }

            JSON.stringify({error: "event undefiend"});
            return;
        }

        ws.send(JSON.stringify({error: "Not Authenticated"}));
        return;
    });
}
