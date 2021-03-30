'use strict';
import fs from "fs";

export default (targetPath, options) => new Promise((resolve, reject) => {
    return fs.readdir(targetPath, options, (error, files) => {
        if (error) return reject(error);
        return resolve(files);
    })
});
