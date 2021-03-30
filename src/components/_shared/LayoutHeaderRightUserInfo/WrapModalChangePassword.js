import * as R from 'ramda';
import React from 'react';
import { Button, Icon, Input, Modal, Spin } from 'antd';
import WrapModalConfirmWithForm from '@components/_shared/WrapModalConfirmWithForm';
import Noop from '@components/_common/Noop';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

function checkNewPassword({ form, password, passwordNewConfirm, passwordNew }) {
    // eslint-disable-next-line no-shadow
    // const passwordNewConfirmNext = e.target.value;
    if (passwordNewConfirm !== passwordNew && passwordNewConfirm) {
        return form.setFields({
            passwordNew: { value: passwordNew },
            passwordNewConfirm: {
                value: passwordNewConfirm,
                errors: [new Error('两次输入密码不一致')]
            }
        });
    }
    if (passwordNew === password || passwordNewConfirm === password) {
        return form.setFields({
            passwordNew: { value: passwordNew },
            passwordNewConfirm: {
                value: passwordNewConfirm,
                errors: [new Error('新密码和现有密码一样')]
            }
        });
    }
    form.setFields({
        passwordNew: { value: passwordNew },
        passwordNewConfirm: { value: passwordNewConfirm }
    });
    form.validateFields(['passwordNewConfirm']);
}

export default class WrapModalChangePassword extends React.Component {
    render() {
        const {
            reqCheckPassword,
            reqModifyPassword,
            renderWrapper
        } = this.props;
        return <WrapModalConfirmWithForm
            propsModal={{
                title: '修改密码',
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
                await validateFields(['passwordNewConfirm']);
                await reqModifyPassword(
                    R.pick(['password', 'passwordNew', 'passwordNewConfirm'], formFieldsValue)
                );
            }}
            renderContentModal={({ form, isUpdating }) => {
                const {
                    stage,
                    password,
                    passwordNew,
                    passwordNewConfirm
                } = form.getFieldsValue(['stage', 'password', 'passwordNew', 'passwordNewConfirm']);
                const stage0PasswordError = form.getFieldError('password');
                const stage1PasswordError = form.getFieldError('passwordNewConfirm');
                return <Spin spinning={isUpdating}>
                    <div style={{ height: 180 }}>
                        {form.getFieldDecorator('stage')(<Noop/>)}
                        {form.getFieldDecorator('password')(<Noop/>)}
                        {form.getFieldDecorator('passwordNew')(<Noop/>)}
                        {form.getFieldDecorator('passwordNewConfirm', {
                            rules: [{
                                required: true,
                                message: '请再次输入新密码',
                            }]
                        })(<Noop/>)}
                        {stage === 0 && <div>
                            <div style={{ marginBottom: 10 }}>
                                <b>验证登陆密码</b>
                            </div>
                            <div><Input
                                size={'large'}
                                type={'password'}
                                maxLength={30}
                                value={password}
                                onChange={e => form.setFieldsValue({ password: e.target.value })}
                                placeholder={'请输入登陆密码'}
                            /></div>
                            {!R.isEmpty(stage0PasswordError) && stage0PasswordError &&
                            <div className={classNamesStyles('modal-input-error')}>
                                {R.head(stage0PasswordError)}
                            </div>}
                        </div>}
                        {stage === 1 && <div>
                            <div style={{ marginBottom: 10 }}>
                                <b>设置新密码</b>
                            </div>
                            <div style={{ marginBottom: 16 }}></div>
                            <div></div>
                            {!R.isEmpty(stage1PasswordError) && stage1PasswordError &&
                            <div className={classNamesStyles('modal-input-error')}>
                                {R.head(stage1PasswordError)}
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
                        <span>取消</span>
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
                                        errors: [new Error('请填写目前的密码')]
                                    }
                                });
                            }
                            const boo = await reqCheckPassword({ password });
                            if (boo) {
                                setFieldsValue({ stage: 1 });
                            } else {
                                setFields({
                                    password: {
                                        errors: [new Error('密码不正确')]
                                    }
                                });
                            }
                        })}
                    >
                        <span>下一步</span>
                    </Button>}
                    {stage === 1 && <Button
                        type={'primary'}
                        style={{ marginLeft: 8 }}
                        loading={isWaiting || isUpdating}
                        onClick={emitOnClickOk}
                    >
                        <span>确定</span>
                    </Button>}
                </div>;
            }}
        />;
    }
}
