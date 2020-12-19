const jwt = require("jsonwebtoken");

const db = require("./db")

const events = {
    // FIXME: group into general handlers and search handlers
    "FETCH_REPOS": async (ws, payload) => {
        const repos = await db.getUserRepos(ws.id);
        const response = {data: repos, error: null}
        console.log("socket response: ", response);
        ws.send(JSON.stringify(response));
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

        JSON.stringify({error: "Not Authenticated"});
        return;
    });
}
