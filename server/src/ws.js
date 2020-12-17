const db = require("./db")

const events = {
}



module.export = (ws, req) => {
    const isAuthenticated = json => {
        // console.log("we already have a token", json);
        if (ws.token) {
            return true;
        } else if (json.token) {
            // FIXME: This could error out
            ws.token = jwt.verify(json.token, "secret");
            return true;
        }
    }

    const handleEvent = (type, payload) => {

    }

    // main socket event
    ws.on("message", async (msg) => {
        try {
            const json = JSON.parse(msg);
        } catch(err) {
            console.error('NOT A VALID JSON' , err);
            return false;
        }

        if (isAuthenticated(json) {
            // continue doing what you're doing
            const type = json.event.type;
            const handler = events[type];
            if (handler) {
                // FIXME: payload could be incorrect, should throw error
                try {
                    await handler(ws, json.event.payload);
                } catch(e) {
                    ws.send(JSON.stringify({error: e}));
                }
            }
        }
        else {
            JSON.stringify({error: "Not Authenticated"});
            return;
        }
    });
}
