import * as R from 'ramda';
import React from 'react';
import { Button, Modal, Form } from 'antd';
import PropTypes from 'prop-types';

const asyncSetState = R.curry((self, nextState) => {
    return new Promise(resolve => {
        try {
            self.setState(nextState, _ => resolve(self.state));
        } catch (error) {
            self.state = { ...self.state, ...nextState };
            resolve(self.state);
        }
    });
});

const renderWrapperDefault = ({ emitClick, children, ...resetProps }) => (
    <div
        {...R.pick(['style', 'className'], resetProps)}
        onClick={emitClick}>
        {children}
    </div>
);

@Form.create({
    // onFieldsChange(props, fieldsChange = {}) {
    //     console.log('onFieldsChange', props, fieldsChange);
    // }
})
export default class WrapModalConfirmWithForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            // contentDataIntl: null
        };
        this._isDidMounted = false;
    }
    componentDidMount() {
        // console.log('componentDidMount');
        this._isDidMounted = true;
    }
    componentWillUnmount() {
        // console.log('componentWillUnmount');
        this._isDidMounted = false;
    }
    onShouldShowModal = onShouldShowModal => async _ => {
        await asyncSetState(this, { isWaitingShow: true });
        // const { contentDataIntl } = this.state;
        // const contentDataIntlNext = await onShouldShowModal({
        //     contentData: contentDataIntl ? { ...contentDataIntl } : null
        // });
        const { form } = this.props;
        const setFieldsValue = async (...params) => form.setFieldsValue(...params);
        const getFieldsValue = (...params) => form.getFieldsValue(...params);
        const resetFields = (...params) => form.resetFields(...params);
        const validateFields = (...params) => form.validateFields(...params);
        const showModal = async () => {
            await asyncSetState(this, { isModalVisible: true });
        };
        try {
            await onShouldShowModal({
                setFieldsValue,
                getFieldsValue,
                resetFields,
                validateFields,
                showModal
            });
            // await showModal();
            await asyncSetState(this, {
                // contentDataIntl: contentDataIntlNext,
                initialFieldsValue: form.getFieldsValue(),
                isWaitingShow: false
            });
        } catch (error) {
            await asyncSetState(this, { isModalVisible: false, isWaitingShow: true });
            throw error;
        }
    }
    updateModalWithData = emitModalWithData => async _ => {
        await asyncSetState(this, { isUpdating: true });
        const { form } = this.props;
        const setFieldsValue = async (...params) => form.setFieldsValue(...params);
        const getFieldsValue = (...params) => form.getFieldsValue(...params);
        const resetFields = (...params) => form.resetFields(...params);
        const validateFields = (...params) => form.validateFields(...params);
        const setFields = (...params) => form.setFields(...params);
        await emitModalWithData({ setFields, setFieldsValue, getFieldsValue, resetFields, validateFields });
        await asyncSetState(this, { isUpdating: false });
    }
    doSomeThingWithFormFieldsValidated = shouldConfirmSubmit => async _ => {
        const { form, formKeysEnsured } = this.props;
        await form.validateFields();
        form.getFieldsValue(formKeysEnsured);
        await shouldConfirmSubmit({
            ...form.getFieldsValue()
        }, {
            resetFields: (...params) => form.resetFields(...params),
            validateFields: async (...params) => form.validateFields(...params)
        });
    }
    doSomeThingWithFormFields = shouldConfirmSubmit => async _ => {
        const {
            form,
            formKeysEnsured,
            onConfirmSubmit = _ => null,
            onCancel = _ => null,
        } = this.props;
        const emitOnClickCancel = this.doSomeThingWithFormFields(onCancel);
        const emitOnClickOk = this.doSomeThingWithFormFieldsValidated(onConfirmSubmit);
        form.getFieldsValue(formKeysEnsured);
        await shouldConfirmSubmit({
            ...form.getFieldsValue()
        }, {
            resetFields: (...params) => form.resetFields(...params),
            validateFields: async (...params) => form.validateFields(...params),
            emitOnClickCancel,
            emitOnClickOk
        });
    }
    shouldEmitCloseAfter = wrappedFunction => async (...args) => {
        const { onBeforeModalClose = _ => null } = this.props;
        if (this.state.isWaitingClose) return null;
        await asyncSetState(this, { isWaitingClose: true });
        try {
            await onBeforeModalClose();
            await wrappedFunction(...args);
            this._isDidMounted && this.setState({ isModalVisible: false });
        } catch (error) {
            console.error(error);
        } finally {
            this._isDidMounted && await asyncSetState(this, { isWaitingClose: false });
        }
        // form.resetFields();
    }
    render() {
        // eslint-disable-next-line no-empty-pattern
        const {
            form,
            // styles = _ => null,
            children = [],
            onShouldShowModalWithData = _ => null,
            // emitUpdate = _ => null,
            propsModal: propsModalMaybe = {},
            onConfirmSubmit = _ => null,
            onCancel = _ => null,
            onOK = _ => null,
            renderContentModal = _ => null,
            classNameButtonModalCancel = '',
            classNameButtonModalConfirm = '',
            renderWrapper = renderWrapperDefault,
            maskCloseable = true,
            sizeButtonDefault = 'default',
            textOk = '确定',
            textCancel = '取消',
            propsButtonModalCancel = {},
            propsButtonModalConfirm = {},
            ...propsReset
        } = this.props;

        const {
            isModalVisible = false,
            isWaitingShow = false,
            isWaitingClose = false,
            isUpdating = false,
            initialFieldsValue = {}
            // contentDataIntl
        } = this.state;

        const isWaiting = isWaitingShow || isWaitingClose;

        const { shouldEmitCloseAfter, doSomeThingWithFormFields, doSomeThingWithFormFieldsValidated } = this;

        const emitOnClickCancel = shouldEmitCloseAfter(doSomeThingWithFormFields(onCancel));

        const emitOnClickOk = shouldEmitCloseAfter(doSomeThingWithFormFieldsValidated(onConfirmSubmit));

        // const emitUpdateWithData = this.updateModalWithData(emitUpdate);

        let propsModal = propsModalMaybe;
        if (typeof propsModalMaybe === 'function') {
            propsModal = propsModalMaybe({ form });
        }

        const {
            renderFooter,
            footer = <div>
                <Button
                    size={sizeButtonDefault}
                    className={classNameButtonModalCancel}
                    style={{ marginLeft: 8 }}
                    loading={isWaitingClose}
                    onClick={emitOnClickCancel}
                    type={'danger'}
                    {...propsButtonModalCancel}
                >
                    <span>{textCancel}</span>
                </Button>
                <Button
                    size={sizeButtonDefault}
                    className={classNameButtonModalConfirm}
                    type={'primary'}
                    style={{ marginLeft: 8 }}
                    loading={isWaitingClose}
                    onClick={emitOnClickOk}
                    {...propsButtonModalConfirm}
                >
                    <span>{textOk}</span>
                </Button>
            </div>
        } = this.props;

        const getFieldsValue = (...params) => form.getFieldsValue(...params);
        const resetFields = (...params) => form.resetFields(...params);
        const validateFields = (...params) => form.validateFields(...params);

        const emitCloseWith = R.compose(shouldEmitCloseAfter, doSomeThingWithFormFields);

        return <React.Fragment>
            {renderWrapper({
                form,
                getFieldsValue,
                resetFields,
                validateFields,
                emitClick: this.onShouldShowModal(onShouldShowModalWithData),
                emitUpdateWith: this.updateModalWithData,
                children,
                ...R.pick(['style', 'className'], propsReset)
            })}
            <Modal
                visible={isModalVisible}
                centered={true}
                closable={false}
                maskClosable={maskCloseable && !isWaitingClose}
                {...propsModal}
                onCancel={emitOnClickCancel}
                footer={typeof renderFooter === 'function' ? renderFooter({
                    isModalVisible,
                    classNameButtonModalCancel,
                    classNameButtonModalConfirm,
                    emitOnClickCancel,
                    emitOnClickOk,
                    // emitOnClickOkWith: R.compose(shouldEmitCloseAfter, doSomeThingWithFormFields),
                    emitCloseWith,
                    isWaiting,
                    isWaitingClose,
                    isWaitingShow,
                    form,
                    getFieldsValue,
                    resetFields,
                    validateFields,
                    isUpdating,
                    emitUpdateWith: this.updateModalWithData,
                    initialFieldsValue
                }) : footer}
            >
                {renderContentModal({
                    isModalVisible,
                    form,
                    getFieldDecorator: form.getFieldDecorator,
                    getFieldsValue,
                    resetFields,
                    validateFields,
                    isWaiting,
                    isWaitingClose,
                    isWaitingShow,
                    emitCloseWith,
                    emitOnClickCancel,
                    emitOnClickOk,
                    isUpdating,
                    emitUpdateWith: this.updateModalWithData
                })}
            </Modal>
        </React.Fragment>;
    }
}

WrapModalConfirmWithForm.propTypes = {
    onShouldShowModalWithData: PropTypes.func,
    onConfirmSubmit: PropTypes.func,
    renderWrapper: PropTypes.func,
    renderContentModal: PropTypes.func,
    classNameButtonModalCancel: PropTypes.string,
    classNameButtonModalConfirm: PropTypes.string,
};
