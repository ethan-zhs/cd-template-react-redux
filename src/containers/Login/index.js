import * as R from 'ramda';
import React from 'react';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';
import model from './model';
import modelAccount from '@models/account';
import { Spin, Icon, Button, Input, Form, message } from 'antd';
import imgDecal01 from './assets/decal-01.png';
import imgDecal02 from './assets/decal-02.png';
import IconInputCheck from '@containers/Login/assets/IconInputCheck';
import hotkeys from 'hotkeys-js';
import asyncSetState from '@utils/react-helper/asyncSetState';
import imgDecal01New from './assets/decal-01-new.png';
import imgDecal02New from './assets/decal-02-new.png';
// import commonRoutes from '../../router/routes/commonRoutes'
import { findFirsRoutePathInMenuVisible } from '@constants/menuSiderNav';
import { TITLE } from '@constants/text';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

@createModuleInjectorBy(model, {
    mapStateToProps: {
        ...modelAccount.stateToSelectors(['userInfo', 'checkUserPermsByKey'])
    },
    mapDispatchToProps: {
        ...modelAccount.sagaToActionDispatches(['login', 'logout', 'getAccountInfo'])
    }
})
class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { formFields: {} };
        this.refInputAccount = React.createRef();
        this.refInputPassword = React.createRef();
    }
    componentDidMount() {
        hotkeys.deleteScope('login');
        hotkeys('enter', { scope: 'login' }, async _ => {
            const { formFields } = this.state;
            if (!formFields.account) {
                return this.refInputAccount.current.focus();
            }
            if (!formFields.password) {
                return this.refInputPassword.current.focus();
            }
            await this.shouldLogin(formFields);
        });
        hotkeys.setScope('login');
    }
    componentWillUnmount() {
        hotkeys.deleteScope('login');
    }
    shouldLogin = async formFields => {
        const { isLogining = false } = this.state;
        if (isLogining) {
            return false;
        }
        const { history } = this.props;
        await asyncSetState(this, { isLogining: true });
        try {
            await this.props.login(formFields);

            const { checkUserPermsByKey } = this.props;
            const firstRoutePath = findFirsRoutePathInMenuVisible(checkUserPermsByKey);
            // console.log('firstRoutePath', firstRoutePath);
            history.replace(firstRoutePath || '/');
            message.success('登录成功');
        } catch (error) {
            await asyncSetState(this, { isLogining: false });
            // console.log('error.response', error.response);
            if (error?.response?.data?.status === 501) {
                return null;
            }
            if (error.displayMessage) {
                message.error(error.displayMessage);
            } else {
                // message.error('登录失败，请更新浏览器或检查网络再尝试');
            }
            throw error;
        }
    }
    render() {
        const { isLogining = false } = this.state;
        if (this.props.authFailedRedirect) {
            return this.props.authFailedRedirect;
        }
        return (
            <div className={classNamesStyles('page-login', 'version2')} style={{ position: 'relative' }}>
                <img className={classNamesStyles('decal')} alt={''} style={{
                    position: 'absolute',
                    top: '60%',
                    left: '12%',
                    width: 173,
                    height: 200
                }} src={imgDecal02New}/>
                <img className={classNamesStyles('decal')} alt={''} style={{
                    position: 'absolute',
                    top: '10%',
                    right: '12%',
                    width: 140 * 0.8,
                    height: 30 * 0.8
                }} src={imgDecal01New} onClick={() => { console.log('click input'); }}/>
                <div className={classNamesStyles('content-page-center')}>
                    <h2 className={classNamesStyles('content-page-title')}>{TITLE}</h2>
                    <div className={classNamesStyles('wrap-login-panel')}>
                        <div className={classNamesStyles('panel')}>
                            <Spin spinning={isLogining}>
                                <div className={classNamesStyles('panel-title')}>帐号登录</div>
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    renderVersion2019() {
        const { isLogining = false } = this.state;
        return (
            <div className={classNamesStyles('page-login')}>
                <div
                    className={classNamesStyles('content-left')}
                    style={{ position: 'relative' }}
                >
                    <img className={classNamesStyles('decal')} alt={''} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '26%',
                        width: 173,
                        height: 200
                    }} src={imgDecal02}/>
                    <h2 className={classNamesStyles('content-page-title')}>{TITLE}</h2>
                    <div className={classNamesStyles('wrap-login-panel')}>
                        <div style={{ height: 0, position: 'relative' }}>
                            <img className={classNamesStyles('decal')} alt={''} style={{
                                position: 'absolute',
                                top: -40,
                                left: -70 * 0.8,
                                width: 140 * 0.8,
                                height: 30 * 0.8
                            }} src={imgDecal01}/>
                        </div>
                        <div className={classNamesStyles('panel')} style={{ marginLeft: -260 }}>
                            <Spin spinning={isLogining}>
                                <div className={classNamesStyles('panel-title')}>帐号登录</div>
                                <FormFieldsType0
                                    propsForm={{
                                        autoComplete: 'on'
                                    }}
                                    className={classNamesStyles('form-login')}
                                    onChange={formFields => {
                                        this.setState({ formFields });
                                    }}
                                    formFieldsSource={[
                                        [
                                            [null, 'account', {}, ({ form, fieldName, key }) => {
                                                const hasValue = !!form.getFieldValue(fieldName);
                                                return <Form.Item key={key} className={classNamesStyles('form-input-tips-positioner')}>
                                                    {form.getFieldDecorator(fieldName)(
                                                        <Input
                                                            autoFocus={true}
                                                            ref={this.refInputAccount}
                                                            autoComplete={'on'}
                                                            placeholder={'请输入帐号'}
                                                            className={classNamesStyles('input-login')}
                                                            onPressEnter={_ => {
                                                                if (R.isNil(form.getFieldValue(fieldName))) {
                                                                    return null;
                                                                }
                                                                this.refInputPassword.current.focus();
                                                            }}
                                                            size={'large'}
                                                        />
                                                    )}
                                                    <div className={classNamesStyles('input-tips-positioner')}>
                                                        <div className={classNamesStyles('fill')}/>
                                                        <Icon className={classNamesStyles('icon-input-check', {
                                                            show: hasValue
                                                        })} component={IconInputCheck} />
                                                    </div>
                                                </Form.Item>;
                                            }]
                                        ],
                                        [
                                            [null, 'password', {}, ({ form, fieldName, key }) => {
                                                const hasValue = !!form.getFieldValue(fieldName);
                                                return <Form.Item key={key}>
                                                    {form.getFieldDecorator(fieldName)(
                                                        <Input
                                                            ref={this.refInputPassword}
                                                            autoComplete={'on'}
                                                            placeholder={'请输入密码'}
                                                            className={classNamesStyles('input-login')}
                                                            type={'password'}
                                                            size={'large'}
                                                            onPressEnter={async _ => {
                                                                try {
                                                                    if (R.isNil(form.getFieldValue(fieldName))) {
                                                                        return null;
                                                                    }
                                                                    await this.shouldLogin(form.getFieldsValue());
                                                                } catch (error) {
                                                                    form.resetFields([fieldName]);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    <div className={classNamesStyles('input-tips-positioner')}>
                                                        <div className={classNamesStyles('fill')}/>
                                                        <Icon className={classNamesStyles('icon-input-check', {
                                                            show: hasValue
                                                        })} component={IconInputCheck} />
                                                    </div>
                                                </Form.Item>;
                                            }]
                                        ],
                                    ]}
                                    renderFooter={({ emitSubmit }) => {
                                        return <Button
                                            onClick={emitSubmit}
                                            size={'large'}
                                            type={'primary'}
                                            htmlType='submit'
                                            className={classNamesStyles('btn-login')}
                                        >登录</Button>;
                                    }}
                                    onSubmit={async formFields => {
                                        await this.shouldLogin(formFields);
                                    }}
                                />
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;
