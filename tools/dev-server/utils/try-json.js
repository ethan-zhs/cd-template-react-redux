export function parse(input, defaultValue = void 0, error = _ => void 0) {
    try {
        return JSON.parse(input);
    } catch (errorMessage) {
        error(errorMessage);
        return defaultValue;
    }
}

export function stringify(input) {
    try {
        return JSON.stringify(input);
    } catch (errorMessage) {
        return '';
    }
}

export default {
    parse,
    stringify
};
