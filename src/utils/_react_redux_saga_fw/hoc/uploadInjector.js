import React, { Component } from 'react';
import portalInjector from './portalInjector';
import { safeObject, uniqWithProp } from '@utils/_react_redux_saga_fw/utils/baseUtils';

let _uploadInjectId = 0;

const consumeUploadInjectId = () => {
    if (_uploadInjectId > 10000) {
        _uploadInjectId = 0;
    }
    _uploadInjectId += 1;
    return _uploadInjectId;
};

class Uploader extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            uploads: []
        };
    }
    // 上传
    composeUpload = (id) => {
        const $input = document.querySelector(`#${this.props.id} #${id} > input`);
        $input && $input.click();
    }
    // 获取 ComposeOss 实例
    composeInstance = (id) => {
        return this[`upload_${id}`];
    }
    // 处理 ComposeOss
    composeOss = (options) => {
        const { id } = options;
        const { uploads } = this.state;
        this.setState({
            uploads: uniqWithProp('id', [{ id, key: id + consumeUploadInjectId() }, ...uploads])
        }, () => {
            this[`upload_${id}`] = this.createComposeOss(options);
        });
    }
    // 创建 ComposeOss
    createComposeOss = (options) => {
        const {
            id,
            ossType = 'OSS',
            uploadType = 'direct',
            multiple = false,
            maxSize = 5,
            uploadImmediately = true,
            token,
            host,
            types = ['image/jpeg', 'image/jpg', 'image/png'],
            handleExpire = () => { },
            fileAdded = (uploadList, uploader) => { },
            progress = (a, b) => { },
            error = (err) => { },
            complete = (res) => { },
            completeQueue = () => { }
        } = safeObject(options);
        return new ComposeOss({
            // 详情请戳 => http://192.168.31.49:3000/zhuhuishao/m-compose-oss
            ossType, // 存储商: OSS (阿里云) / QINIU (七牛云) / COS (腾讯云) / VOD (腾讯云)
            uploadType, // 上传类型: direct (直传) / multipart (断点分片)
            multiple, // 是否允许多选
            maxSize, // 文件大小限制
            uploadImmediately, // 是否立刻上传
            token, // 上传token
            host, // 上传host
            types, // 上传类型
            upload_button: id, // 上传触发元素id
            container: id, // upload_button父元素
            handleExpire, // token认证错误
            fileAdded, // 文件添加回调
            progress, // 进度事件
            error, // 错误回调
            complete, // 完成回调
            completeQueue, // 队列完成回调
        });
    }
    render() {
        return this.state.uploads.map(item => <div key={item.key} id={item.id} />);
    }
}


export default ({ id }) => WrappedComponent => {
    class UploadInjector extends Component {
        static WrappedComponent = WrappedComponent;
        static displayName = `withPortal(${WrappedComponent.displayName ||
            WrappedComponent.name || 'Component'})`;
        constructor(...args) {
            super(args);
            consumeUploadInjectId();
            this.state = {
                uploadInjectId: id + _uploadInjectId
            };
            this.portalUploader = portalInjector({ id: id + _uploadInjectId })(Uploader);
        }
        render() {
            const { uploadInjectId } = this.state;
            const PortalUploader = this.portalUploader;
            return (
                <React.Fragment>
                    <WrappedComponent
                        composeInstance={(i) => this.uploader && this.uploader.composeInstance(i)}
                        composeUpload={(i) => this.uploader && this.uploader.composeUpload(i)}
                        composeOss={(options) => this.uploader && this.uploader.composeOss(options)}
                        {...this.props}
                    />
                    <PortalUploader id={uploadInjectId} ref={(ref) => { this.uploader = ref; }} />
                </React.Fragment>
            );
        }
    }
    return UploadInjector;
};

