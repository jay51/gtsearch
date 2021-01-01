const util = require("util");
const path = require("path");
const fs = require("fs");

const {getPath} = require("./utils");

const exec = util.promisify(require("child_process").execFile);
const remove = util.promisify(require('rimraf'));
const mkdir = util.promisify(fs.mkdir);

class Git {
    static beingPulled = new Set();

    /* @return Array of all branches */
    static getAllBranches = async (name) => {
        const repoPath = getPath(name);
        const {stdout} = await exec("git",
            ["-C", repoPath, "branch", "--list", ]
        );
        return stdout.split("\n").map(b => b.replace("*", "").trim());
    }

    /* @return current branch name */
    static getCurrentBranch = async (name) => {
        const repoPath = getPath(name);
        const {stdout} = await exec("git",
            ["-C", repoPath, "rev-parse", "--abbrev-ref", "HEAD", ]
        );
        return stdout.trim();
    }

    /* checkout branch */
    static checkout = async (name, branch) => {
        const repoPath = getPath(name);
        const {stdout} = await exec("git",
            ["-C", repoPath, "checkout", `origin/${branch}`, ]
        );
    }

    /* remove old repo if already exist and clone repo */
    static clone = async (url, name, branch="HEAD") => {
        const repoPath = getPath(name);
        // maybe use events to tell user what's going on
        this.beingPulled.add(name);

        await remove(repoPath);
        await mkdir(repoPath, {recursive: true});
        await exec("git",
            ["clone", "--quiet", "--", url, repoPath, ]
        );
        await Git.checkout(name, branch);
    }

    /* pull the branch by fetching and reseting to origin/<branch> */
    static pull = async (url, name) => {
        const repoPath = getPath(name);
        const branc = Git.getCurrentBranch(name);

        await remove(repoPath);
        await mkdir(repoPath, {recursive: true});

        // git fetch origin <branch>
        await exec("git",
            ["-C", repoPath, "-f", "--quiet", "origin", branch, ],
            {timeout: 60 * 1000}
        );

        // git reset --hard origin/<branch>
        await exec("git",
            ["-C", repoPath, "reset", "--hard", `origin/${branch}`, ]
        );
    }
}

module.exports = Git;
