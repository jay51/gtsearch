const util = require("util");
const path = require("path");
const fs = require("fs");

const exec = util.promisify(require("child_process").execFile);
const remove = util.promisify(require('rimraf'));
const mkdir = util.promisify(fs.mkdir);

class Git {
    static basePath = path.join(__dirname, '..', 'var', "clones")
    static beingPulled = new Set();

    /*
     * @return path to repo on disk
     */
    static getPath = name => path.join(Git.basePath, name);

    static getCurrentBranch = async (name) => {
        repoPath = Git.getPath(name);
        const {stdout} = await exec("git",
            ["-C", dir, "rev-parse", "--abbrev-ref", "HEAD", ]
        );
        return stdout.trim();
    }

    static clone = async (url, name) => {
        const repoPath = Git.getPath(name);
        // maybe use events to tell user what's going on
        this.beingPulled.add(name);

        await remove(repoPath);
        await mkdir(repoPath, {recursive: true});
        await exec("git",
            ["clone", "--quiet", "--", url, repoPath, ]
        );
    }
}

module.exports = Git;
