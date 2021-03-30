import queryString from 'querystring';

export function parse(str, ...etc) {
    try {
        return queryString.parse(str, ...etc);
    } catch (error) {
        return {};
    }
}

export function stringify(obj, ...etc) {
    try {
        return queryString.stringify(obj, ...etc);
    } catch (error) {
        return '';
    }
}

export default { parse, stringify };
