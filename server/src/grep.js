const util = require("util");
const path = require("path");
const EventEmitter = require('events')
const child_process = require("child_process")

const {getPath} = require("./utils");


class Search extends EventEmitter {
    constructor({user_id, query, excludeDir, excludeFile, ignoreCase, name}) {
        super();
        this.query = query;
        this.path = getPath(user_id.toString(), name);
        this.buffer = [];
        this.process = child_process.spawn(
            "grep",

            [
                ...excludeDir.map(s => "--exclude-dir=" + s),
                ...excludeFile.map(s => "--exclude=" + s),
                "--fixed-strings",
                "--recursive",
                "--color=never",
                "--with-filename",
                "--line-number",
                "--line-buffered",
                "--null",
                "--ignore-case",
                "--context=3",

                "-e",
                query,
                this.path,
            ],
        );
    }

    static runningProcesses = [];

    start = () => {
        console.log("new search for: ", this.query);
        /* NOTE: grep output is bufferd be careful.
         * '--context' tag makes grep buffer output and cut lines.
         * '--line-buffered' make grep buffer but not cut lines
         */
        this.process.stdout.on('data', (data) => {
            const result = this.parse(data.toString().split("\n"));
            this.buffer = this.buffer.concat(result);
        });

        this.process.stderr.on('data', (data) => {
            console.error(`this.process stderr: ${data}`);
            this.emit("stderr", data); 
        });

        this.process.on('error', (code) => {
            console.log(`error process exited with code ${code}`);
            this.emit("error", data);
        });

        this.process.on('exit', (code) => {
            // console.log(`exit process exited with code ${code}`);
            this.emit("data", this.buffer);
            this.emit("exit", code);
        });
    }

    kill() {
        const signal = "SIGTERM";
        this.process.kill(signal);
    }

    static killRunningProcesses() {
        for(let task of Search.runningProcesses) {
            task.kill();
        }
    }

    /*
     * index lines by filePath inside an Array of objects
     * @return array of objects (each object represents a file)
     */
    parse = lines => {
        if (!lines.length) return lines;
        const searches = []

        for(const line of lines) {
            let [filePath, code] = line.split("\0");
            if (!filePath || !code) continue;

            let codeIdx = null;
            let lineNumber = "";

            for (let i = 0; i < code.length; i++) {
                if (code[i] === ":" || code[i] === "-") {
                    lineNumber = parseInt(lineNumber);
                    codeIdx = i+1;
                    break;
                }
                lineNumber += code[i];
            }

            code = code.substring(codeIdx).trim();
            if (code) {
                let search = searches.filter(s => s.filePath === filePath )[0];

                if (search) {
                    search.lines.push({code, lineNumber});
                }
                else {
                    search = {filePath, lines: [{line:code, lineNumber}]};
                    searches.push(search);
                }
            }
        }
        return searches;
    }
}

module.exports = {
    Search,
}

