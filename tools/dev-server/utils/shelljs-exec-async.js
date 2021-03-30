'use strict';
import shelljs from 'shelljs';

export default (command, options) => new Promise((resolve, reject) => {
    return shelljs.exec(command, options, (code, stdout, stderr) => {
        resolve([code, stdout, stderr])
    });
});
