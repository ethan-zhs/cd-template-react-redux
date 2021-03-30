import { Modal } from 'antd';
import { Modal as MobileModal } from 'antd-mobile';
import { history } from '@src/App';

let globalTipsInstance = null;

let lastTitle = null;

let lastMessage = null;

let isShowGlobalTips = false;

function globalTips(opts) {
    const showModal = props => {
        const { type, ...restProps } = props;
        return Modal[type](restProps);
    };

    const {
        type = 'error',
        title = '出错了',
        message,
        okText,
        error,
        callback = _ => null,
        callbackCancel = null
    } = opts;

    if (title === lastTitle
        && message === lastMessage
        && isShowGlobalTips
    ) {
        console.warn(`${title}: ${message} (duplicated)`);
        return false;
    }

    if (globalTipsInstance) {
        globalTipsInstance.destroy();
    }

    lastTitle = title;

    lastMessage = message;

    isShowGlobalTips = true;

    globalTipsInstance = showModal({
        type,
        zIndex: 99999,
        title: title,
        content: message,
        callback: () => callback({ history, error }),
        ...typeof callbackCancel === 'function' && {
            callbackCancel: () => callbackCancel({ history, error }),
        },
        okText,
        onOk: async () => {
            await callback({ history, error });
            isShowGlobalTips = false;
        },
        onCancel: async () => {
            typeof callbackCancel === 'function' && await callbackCancel({ history, error });
            isShowGlobalTips = false;
        }
    });
}

export default globalTips;
