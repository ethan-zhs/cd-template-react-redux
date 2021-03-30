const HTTP = 'http://';
const HTTPS = 'https://';
const CURRENT_PROTOCOL = `${window.location.protocol}//`;

export const TEST_API_SERVER = CURRENT_PROTOCOL + 'test_api_domain'/* + version */;
export const LOCAL_API_SERVER = HTTP + 'test_api_domain';
export const RELEASE_API_SERVER = HTTPS + 'api_domain';

// eslint-disable-next-line
const LOCALHOST_IP = process.env.LOCALHOST_IP;

const TEST_API_MOCK = '/-mock-backend-api-';

const LOCAL_API_SERVER_MAYBE_MOCK = process.env.MOCKING_ENABLE ?
    TEST_API_MOCK : LOCAL_API_SERVER;

const apiList = {
    ...LOCALHOST_IP && { [LOCALHOST_IP]: LOCAL_API_SERVER_MAYBE_MOCK },
    localhost: TEST_API_SERVER,
    'test-domain': TEST_API_SERVER,
    'prod-domain': RELEASE_API_SERVER
};

export const ApiBaseName = apiList[window.location.hostname] || RELEASE_API_SERVER;
