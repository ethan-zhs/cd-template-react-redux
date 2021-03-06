import * as R from 'ramda';
import React from 'react';
import { Button, Icon, Input, Modal, Spin, message } from 'antd';
import WrapModalConfirmWithForm from '@components/_shared/WrapModalConfirmWithForm';
import Noop from '@components/_common/Noop';
import { createCacheStorage } from '@utils/cacheStorage';
import { getCountdownTaskByKey, getCountdownTaskExistedByKey } from './utils/countDown';
import asyncSetState from '@utils/react-helper/asyncSetState';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

const cacheStorage = createCacheStorage(30 * 60 * 1000, 'change_mobile_phone');

const KEY_PHONE_NUMBER_SMS = 'KEY_PHONE_NUMBER_VERIFICATION_CODE_SMS';

const KEY_VERIFICATION_CODE_SMS = 'KEY_VERIFICATION_CODE_SMS';

const duration1Minute = 60 * 1000; // 60 * 1000;

export default class WrapModalChangeMobilePhone extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.refInputVerifyCode = React.createRef();
    }
    componentDidMount() {
        const { form } = this.props;
        this.isDidMounted = true;
        this.processCountdownVerifyCodeSMS();
    }
    componentWillUnmount() {
        cacheStorage.removeItem(KEY_PHONE_NUMBER_SMS);
        this.isDidMounted = false;
        const task = getCountdownTaskExistedByKey(KEY_VERIFICATION_CODE_SMS, duration1Minute);
        if (task) {
            task.cancel();
        }
    }
    processCountdownVerifyCodeSMS = _ => {
        const task = getCountdownTaskExistedByKey(KEY_VERIFICATION_CODE_SMS, duration1Minute);
        // console.log('processCountdownVerifyCodeSMS task', !!task)
        if (task) {
            this.isDidMounted && this.setState({
                isFetchingLoginVerifyCodeSMS: true,
                durationWaitingFetchNextLoginVerifyCode: duration1Minute
            });
            task.onStep(passed => {
                // console.log('step', passed, this.isDidMounted);
                this.isDidMounted && this.setState({
                    durationWaitingFetchNextLoginVerifyCode: duration1Minute - passed
                });
            });
            task.then(_ => {
                cacheStorage.removeItem(KEY_PHONE_NUMBER_SMS);
                this.isDidMounted && this.setState({
                    isFetchingLoginVerifyCodeSMS: false
                });
            });
        }
        return task || Promise.resolve();
    }
    shouldGetLoginVerifyCode = async ({ phone, password }, form) => {
        if (this.state.isFetchingLoginVerifyCodeSMS) return null;
        const { getLoginVerifyCodeSMS } = this.props;
        await form.validateFields(['phone']);
        await asyncSetState(this, {
            isFetchingLoginVerifyCodeSMS: true,
            durationWaitingFetchNextLoginVerifyCode: duration1Minute
        });
        try {
            // const mobilePhone = form.getFieldValue('mobilePhone');
            cacheStorage.setItem(KEY_PHONE_NUMBER_SMS, phone);
            await getLoginVerifyCodeSMS({
                mobile_number: phone,
                password
            });
            message.success('??????????????????');
            if (this.refInputVerifyCode.current) {
                this.refInputVerifyCode.current.input.focus();
            }
            getCountdownTaskByKey(KEY_VERIFICATION_CODE_SMS, duration1Minute);
            await this.processCountdownVerifyCodeSMS();
        } catch (error) {
            message.error(error?.displayMessage || '?????????????????????');
            form.setFields({
                phone: {
                    value: phone,
                    errors: [new Error(error?.displayMessage || '?????????????????????')]
                }
            });
            // await form.validateFields(['phone']);
        } finally {
            this.isDidMounted && await asyncSetState(this, { isFetchingLoginVerifyCodeSMS: false });
        }
    }
    render() {
        const {
            reqCheckPassword,
            reqModifyMobileNumber,
            renderWrapper
        } = this.props;

        const {
            isFetchingLoginVerifyCodeSMS = false,
            durationWaitingFetchNextLoginVerifyCode = 0
        } = this.state;

        return <WrapModalConfirmWithForm
            propsModal={{
                title: '????????????',
                closable: true,
                width: 450,
                wrapClassName: classNamesStyles('modal-change-password'),
                zIndex: 1500
            }}
            renderWrapper={renderWrapper}
            onShouldShowModalWithData={async ({ setFieldsValue, showModal }) => {
                setFieldsValue({
                    stage: 0,
                    password: null,
                    passwordNew: null,
                    passwordNewConfirm: null
                });
                await showModal();
            }}
            onConfirmSubmit={async (formFieldsValue, { validateFields }) => {
                await validateFields(['phone', 'verificationCode']);
                await reqModifyMobileNumber({
                    mobile_number: formFieldsValue.phone,
                    password: formFieldsValue.password,
                    verificationCode: formFieldsValue.verificationCode
                });
                await this.props.getAccountInfo({
                    isDontSpawnMessagePollingTask: true,
                    userInfoPatch: {
                        mobile_number: formFieldsValue.phone,
                    }
                });
                message.success('??????????????????????????????');
            }}
            renderContentModal={({ form, isUpdating }) => {
                const {
                    stage,
                    password,
                    phone,
                    verificationCode
                } = form.getFieldsValue(['stage', 'password', 'phone', 'verificationCode']);
                const stage0PasswordError = form.getFieldError('password');
                const stage1PhoneError = form.getFieldError('phone');
                const stage1VerifyCodeError = form.getFieldError('verificationCode');
                return <Spin spinning={isUpdating}>
                    <div style={{ height: 180 }}>
                        {form.getFieldDecorator('stage')(<Noop/>)}
                        {form.getFieldDecorator('password')(<Noop/>)}
                        {form.getFieldDecorator('phone', {
                            rules: [{
                                validator: (_, value, callback) => {
                                    if (R.isEmpty(value)) return callback();
                                    const isPass = /^\d+$/.test(value);
                                    if (isPass) {
                                        if (!(/^1[3456789]\d{9}$/.test(value)) && R.prop('length', value) > 1) {
                                            return callback('???????????????????????????');
                                        }
                                        return callback();
                                    }
                                    return callback('???????????????????????????');
                                }
                            }]
                        })(<Noop/>)}
                        {form.getFieldDecorator('verificationCode', {
                            rules: [{
                                required: true,
                                message: '??????????????????',
                            }]
                        })(<Noop/>)}
                        {stage === 0 && <div>
                            <div style={{ marginBottom: 10 }}>
                                <b>??????????????????</b>
                            </div>
                            <div><Input
                                size={'large'}
                                type={'password'}
                                maxLength={30}
                                value={password}
                                onChange={e => form.setFieldsValue({ password: e.target.value })}
                                placeholder={'?????????????????????'}
                            /></div>
                            {!R.isEmpty(stage0PasswordError) && stage0PasswordError &&
                            <div className={classNamesStyles('modal-input-error')}>
                                {R.head(stage0PasswordError)}
                            </div>}
                        </div>}
                        {stage > 0 && <div>
                            <div style={{ marginBottom: 10 }}>
                                <b>????????????</b>
                            </div>
                            <div><Input
                                key={'phone'}
                                name={'phone'}
                                size={'large'}
                                value={phone}
                                onChange={e => {
                                    form.setFieldsValue({
                                        phone: e.target.value,
                                    });
                                    form.validateFields(['phone']);
                                }}
                                placeholder={'???????????????????????????'}
                            /></div>
                            <div className={classNamesStyles('modal-input-error')} style={{ marginBottom: 16 }}>
                                {!R.isEmpty(stage1PhoneError) && stage1PhoneError && R.head(stage1PhoneError)}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Input
                                    key={'verifyCode'}
                                    name={'verifyCode'}
                                    size={'large'}
                                    ref={this.refInputVerifyCode}
                                    value={verificationCode}
                                    onChange={e => {
                                        form.setFieldsValue({
                                            verificationCode: e.target.value
                                        });
                                    }}
                                    maxLength={6}
                                    placeholder={'????????????????????????'}
                                />
                                <div
                                    className={classNamesStyles('with-btn-get-verify-code')}
                                    style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}
                                >
                                    <Button
                                        type={'primary'}
                                        size={'small'}
                                        disabled={isFetchingLoginVerifyCodeSMS}
                                        onClick={
                                            isFetchingLoginVerifyCodeSMS ?
                                                _ => null : async () => {
                                                    await form.validateFields(['phone']);
                                                    await this.shouldGetLoginVerifyCode(
                                                        form.getFieldsValue(['phone', 'password']),
                                                        form
                                                    );
                                                }
                                        }
                                    >
                                        {isFetchingLoginVerifyCodeSMS ?
                                            <React.Fragment>
                                                <span>????????????</span>
                                                {durationWaitingFetchNextLoginVerifyCode &&
                                                <span>({Math.ceil(
                                                    durationWaitingFetchNextLoginVerifyCode / 1000
                                                )}???)</span>}
                                            </React.Fragment> :
                                            <div>????????????</div>}
                                    </Button>
                                </div>
                            </div>
                            {!R.isEmpty(stage1VerifyCodeError) && stage1VerifyCodeError &&
                            <div className={classNamesStyles('modal-input-error')}>
                                {R.head(stage1VerifyCodeError)}
                            </div>}
                        </div>}
                    </div>
                </Spin>;
            }}
            renderFooter={(props) => {
                const {
                    form,
                    isWaitingClose,
                    isWaiting,
                    isUpdating,
                    emitOnClickCancel,
                    emitUpdateWith,
                    emitOnClickOk
                } = props;
                const { stage } = form.getFieldsValue(['stage']);
                return <div>
                    <Button
                        style={{ marginLeft: 8 }}
                        loading={isWaitingClose}
                        onClick={emitOnClickCancel}
                    >
                        <span>??????</span>
                    </Button>
                    {stage === 0 && <Button
                        type={'primary'}
                        style={{ marginLeft: 8 }}
                        loading={isWaiting || isUpdating}
                        onClick={emitUpdateWith(async ({ setFields, setFieldsValue, getFieldsValue }) => {
                            const { password } = getFieldsValue(['password']);
                            if (!password) {
                                setFields({
                                    password: {
                                        errors: [new Error('????????????????????????')]
                                    }
                                });
                            }
                            const boo = await reqCheckPassword({ password });
                            if (boo) {
                                setFieldsValue({ stage: 1 });
                            } else {
                                setFields({
                                    password: {
                                        errors: [new Error('???????????????')]
                                    }
                                });
                            }
                        })}
                    >
                        <span>?????????</span>
                    </Button>}
                    {stage === 1 && <Button
                        type={'primary'}
                        style={{ marginLeft: 8 }}
                        loading={isWaiting || isUpdating}
                        onClick={emitOnClickOk}
                    >
                        <span>??????</span>
                    </Button>}
                </div>;
            }}
        />;
    }
}
