'use strict';
import fs from 'fs';

export default targetPath => new Promise((resolve, reject) => {
    return fs.readFile(targetPath, (error, files) => {
        if (error) return reject(error);
        return resolve(files);
    })
});
