
export default function createWS(host, token) {
    const ws = new WebSocket(host);
    ws.onopen = () => {
        if (token) {
            const msg = { event: {type: "FETCH_REPOS", payload: {}}, token};
            console.log("sending saved token", msg);
            ws.send(JSON.stringify(msg));
        }
    }
    return ws;
}
