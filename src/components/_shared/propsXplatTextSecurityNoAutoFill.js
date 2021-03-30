const classNamesStyles = require('classnames/bind').bind(require('./propsXplatTextSecurityNoAutoFill.less'));

// eslint-disable-next-line no-prototype-builtins
const isInWebkit = document.body.style.hasOwnProperty('webkitTextSecurity');

export default function (transfer = _ => _) {
    if (isInWebkit) {
        return transfer({
            className: classNamesStyles('like-type-password')
        });
    }
    return transfer({
        type: 'password',
        autoComplete: 'off'
    });
}
