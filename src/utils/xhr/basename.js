/* http && https */
const HTTP = 'http://';
const HTTPS = 'https://';
const CURRENT_PROTOCOL = `${window.location.protocol}//`;

export const DEV_API_SERVER = HTTP + '192.168.31.108:8350'/* + version */;
export const TEST_API_SERVER = CURRENT_PROTOCOL + 'testdomain/newmngservice'/* + version */;
export const LOCAL_API_SERVER = HTTPS + 'testdomain/xsdcloudmngservice';
export const RELEASE_API_SERVER = HTTPS + 'prodomain/xsdcloudmngservice';

// eslint-disable-next-line
const LOCALHOST_IP = process.env.LOCALHOST_IP;

// console.log('LOCALHOST_IP', LOCALHOST_IP);

const TEST_API_MOCK = '/-mock-backend-api-';

const LOCAL_API_SERVER_MAYBE_MOCK = process.env.MOCKING_ENABLE ?
    TEST_API_MOCK : LOCAL_API_SERVER;

const apiList = {
    ...LOCALHOST_IP && { [LOCALHOST_IP]: LOCAL_API_SERVER_MAYBE_MOCK },
    localhost: LOCAL_API_SERVER,
    'test-domain': LOCAL_API_SERVER
};

export const ApiBaseName = apiList[window.location.hostname] || RELEASE_API_SERVER;
