'use strict';
import fs from "fs";

export default targetPath => new Promise((resolve, reject) => {
    return fs.stat(targetPath, (error, stats) => {
        if (error) return reject(error);
        return resolve(stats);
    })
})
