export default function getCharLength(text = '') {
    let i = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const char of typeof text === 'string' ? text : '') {
        // eslint-disable-next-line
        i = i + 1;
    }
    return i;
}
