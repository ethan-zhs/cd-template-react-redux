export function createCacheStorage(expire, keySuffix = '', IWebStorage = localStorage) {
    const _keySuffixTimeStamp = '_time';
    const _keySuffix = `_${keySuffix}`;
    const wrapKey = key => `${key + _keySuffix}`;

    function setItem(key, value) {
        IWebStorage.setItem(wrapKey(key), value);
        IWebStorage.setItem(wrapKey(key) + _keySuffixTimeStamp, Date.now());
    }

    function getItem(key) {
        const lastTimeStamp = IWebStorage.getItem(wrapKey(key) + _keySuffixTimeStamp);
        if (!lastTimeStamp) return null;
        if (!((Date.now() - lastTimeStamp) < expire)) return null;
        return IWebStorage.getItem(wrapKey(key));
    }

    function removeItem(key) {
        IWebStorage.removeItem(wrapKey(key));
        IWebStorage.removeItem(wrapKey(key) + _keySuffixTimeStamp);
    }

    function ensureItem(key, value) {
        const lastValue = getItem(key);
        setItem(key, lastValue || value);
    }
    
    return {
        ensureItem,
        setItem,
        getItem,
        removeItem
    };
}
