const fs = require('fs-extra')
const path = require("path");
const replace = require('replace-in-file');

// fix long prisma loading times caused by scanning from process.cwd(), which returns "/" when run in electron
// (thus it scans all files on the computer.) See https://github.com/prisma/prisma/issues/8484
const files = path.join(__dirname, "src", "generated", "client", "index.js");
console.log("looking at files ", files)
const options = {
    files: files,
    from: "findSync(process.cwd()",
    to: `findSync(require('electron').app.getAppPath()`,
};

const results = replace.sync(options);
console.log('Replacement results:', results);

// Copy the generated prisma client to the dist folder
fs.copySync(path.join(__dirname, "src", "generated"),
    path.join(__dirname, "dist", "generated"),{
        filter: (src, dest) => {
            // Prevent duplicate copy of query engine. It will already be in extraResources in electron-builder.yml
            if (src.match(/query_engine/) || src.match(/libquery_engine/) || src.match(/esm/)){
                return false;
            }
            return true;
        }
    });

