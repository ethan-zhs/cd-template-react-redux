import * as R from 'ramda';
import React, { Component } from 'react';
import { Button, Dropdown, Icon, message, Modal, Spin, Tooltip, Divider } from 'antd';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';
// import modelNoop from '@models/noop';
import modelAccount from '@models/account';
import modelMessage, { MESSAGE_TYPE_TO_NAME } from '@models/message';

import styles from './index.less';
import ensureArray from '@utils/type-helper/ensureArray';
import TextAutoSizeWithMaxWidth from '@components/_shared/TextAutoSizeWithMaxWidth';
import SvgIconLaba from '@components/_shared/LayoutHeaderRightUserInfo/SvgIconLaba';

import TimeAgo from 'javascript-time-ago';
import zh from 'javascript-time-ago/locale/zh-Hans-SG';
import WrapModalChangePassword from '@components/_shared/LayoutHeaderRightUserInfo/WrapModalChangePassword';
import WrapModalChangeMobilePhone from '@components/_shared/LayoutHeaderRightUserInfo/WrapModalChangeMobilePhone';
import SvgShapeMan from '@components/_shared/LayoutHeaderRightUserInfo/SvgShapeMan';
import SvgIconExit from '@components/_shared/LayoutHeaderRightUserInfo/SvgIconExit';
import SvgIconPassword from '@components/_shared/LayoutHeaderRightUserInfo/SvgIconPassword';
import SvgIconMobile from '@components/_shared/LayoutHeaderRightUserInfo/SvgIconMobile';
import SvgIconEdit from '@components/_shared/LayoutHeaderRightUserInfo/SvgIconEdit';
import Authorized from '@components/_shared/Authorized';

TimeAgo.addLocale(zh);

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

@createModuleInjectorBy(null, {
    mapStateToProps: {
        ...modelAccount.stateToSelectors(['userInfo']),
        ...modelMessage.stateToSelectors([
            'countUnreadMessage'
        ])
    },
    mapDispatchToProps: {
        ...modelAccount.sagaToActionDispatches([
            'login', 'logout', 'getAccountInfo', 'reqCheckPassword', 'reqModifyPassword',
            'getLoginVerifyCodeSMS', 'reqModifyMobileNumber'
        ]),
        ...modelMessage.sagaToActionDispatches([
            'fetchHeadListMessages',
        ])
    }
})
class LayoutHeaderRight extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    logout = async () => {
        await new Promise((resolve, reject) => {
            Modal.confirm({
                zIndex: 2000,
                title: '退出登录',
                content: '确认退出登录吗?',
                onOk: () => resolve(),
                onCancel: () => reject()
            });
        });
        await this.props.logout();
        message.warning('已登出');
    }

    render() {
        // const countUnreadMessage = 27;
        const {
            userInfo,
            countUnreadMessage,
            reqCheckPassword,
            reqModifyPassword,
            getLoginVerifyCodeSMS,
            reqModifyMobileNumber
        } = this.props;

        const { name = '' } = userInfo;

        const {
            isVisibleMessagePanel = false,
            isVisibleUserPanel = false
        } = this.state;

        // console.log('history', this.props.history);

        const overlayDropdown = (
            <div className={classNamesStyles('panel-messages')}>
                <div
                    className={classNamesStyles('panel-messages-title')}
                >
                    <b>系统消息</b>
                    <Icon
                        className={classNamesStyles('clickable')}
                        type="close"
                        onClick={() => {
                            this.setState({ isVisibleMessagePanel: false });
                        }}
                    />
                </div>
                <Authorized
                    authKeys={[
                        // ['canTaskDetail', 't_taskShow'],
                        ['canTaskReviewReply', 't_replyUpdate'],
                        // ['canTaskReplyDetail', 't_replyShow'],
                        ['canTaskReply', 't_replyStore'],
                    ]}
                    render={(propsAuthKeys) => {
                        return <ul>
                            <li>系统消息1</li>
                            <li>系统消息2</li>
                            <li>系统消息3</li>
                        </ul>;
                    }}
                />
            </div>
        );

        const userNameTitleSuffix = ensureArray(userInfo.user_role).some(num => R.includes(+num, [1, 2, 3])) ?
            '管理员' : '成员';

        const overlayDropdownUsers = (
            <div className={classNamesStyles('panel-user')}>
                <div className={classNamesStyles('decal-tri')}/>
                <div className={classNamesStyles('row-user-name')}>
                    <div className={classNamesStyles('value')}>{name || ''}</div>
                    <div className={classNamesStyles('type')}>{userInfo.departmentName}{userNameTitleSuffix}</div>
                </div>
                <Divider style={{ margin: '10px 0' }} />
                <div className={classNamesStyles('row-item')}>
                    <Icon component={SvgIconMobile} style={{ marginRight: 5, fontSize: 16 }}/>
                    <WrapModalChangeMobilePhone
                        reqCheckPassword={reqCheckPassword}
                        getLoginVerifyCodeSMS={getLoginVerifyCodeSMS}
                        reqModifyMobileNumber={reqModifyMobileNumber}
                        getAccountInfo={this.props.getAccountInfo}
                        renderWrapper={({ emitClick }) => {
                            return <div>
                                {userInfo.mobile_number ?
                                    <React.Fragment>
                                        <div
                                            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                                        >
                                            <span>{userInfo.mobile_number}</span>
                                            <Icon
                                                title={'修改手机号'}
                                                onClick={emitClick}
                                                className={classNamesStyles('clickable')}
                                                style={{ display: 'inline-block', marginLeft: 5, color: '#0F6EDD' }}
                                                // type="edit"
                                                component={SvgIconEdit}
                                            />
                                        </div>
                                    </React.Fragment> :
                                    <div
                                        title={'绑定手机号'}
                                        onClick={emitClick}
                                        className={classNamesStyles('clickable')}
                                        style={{ display: 'inline-block' }}>绑定手机</div>
                                }
                            </div>;
                        }}
                    />
                </div>
                <div className={classNamesStyles('row-item')}>
                    <Icon component={SvgIconPassword} style={{ marginRight: 5, fontSize: 16 }}/>
                    <WrapModalChangePassword
                        reqCheckPassword={reqCheckPassword}
                        reqModifyPassword={reqModifyPassword}
                        renderWrapper={({ emitClick }) => {
                            return <div
                                title={'修改密码'}
                                onClick={emitClick}
                                className={classNamesStyles('clickable')}
                            >
                                <span>修改密码</span>
                            </div>;
                        }}
                    />
                </div>
                <div className={classNamesStyles('row-item')}>
                    <Icon component={SvgIconExit} style={{ marginRight: 5, fontSize: 16 }}/>
                    <span className={classNamesStyles('clickable')} onClick={this.logout}><div>退出登录</div></span>
                </div>
                <div className={classNamesStyles('row-last-child')}/>
            </div>
        );

        // console.log('countUnreadMessage', countUnreadMessage);

        return (
            <div className={styles['layout-header-right']}>
                <Authorized
                    authKeys={[
                        // t_notification
                        ['canTaskTaskNotification', 't_notification'],
                    ]}
                    render={(propsAuthKeys) => {
                        if (!propsAuthKeys.canTaskTaskNotification) {
                            return null;
                        }
                        return (
                            <div className={styles['message']} style={{ marginRight: 20, fontSize: 16 }}>
                                <div className={`${styles['clickable']} ${styles['message']}`}>
                                    <Dropdown
                                        visible={isVisibleMessagePanel}
                                        placement={'bottomRight'}
                                        trigger={['click']}
                                        onVisibleChange={(visible) => {
                                            if (visible === true) {
                                                this.props.fetchHeadListMessages();
                                            }
                                            this.setState({
                                                isVisibleMessagePanel: visible,
                                                ...visible && {
                                                    isVisibleUserPanel: false
                                                }
                                            });
                                        }}
                                        overlay={overlayDropdown}
                                        // overlayStyle={{ paddingTop: 20 }}
                                    >
                                        <Tooltip placement={'bottom'} title={'消息'}>
                                            <div className={classNamesStyles('iconMessage', {
                                                showTinyRedDot: countUnreadMessage > 0
                                            })}>
                                                {/* <Icon type="bell" theme="filled"/> */}
                                                <Icon component={SvgIconLaba}/>
                                                <div
                                                    className={classNamesStyles('tinyRedDot', {
                                                        doubleWidth: countUnreadMessage >= 10,
                                                        'animated tada infinite': countUnreadMessage > 0
                                                    })}
                                                >
                                                    <TextAutoSizeWithMaxWidth
                                                        wrapperClassName={classNamesStyles('svg-text-offset')}
                                                        text={countUnreadMessage > 99 ? '99+' : countUnreadMessage}
                                                        noWrap={true}
                                                        style={{
                                                            color: '#fff',
                                                            height: '90%',
                                                            width: countUnreadMessage > 100 ? '100%' : '84%',
                                                            // lineHeight: '12px',
                                                            textAlign: 'center',
                                                            // paddingTop: 1
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Tooltip>
                                    </Dropdown>
                                </div>
                            </div>
                        );
                    }}
                />
                <div className={styles['user-logout']}>
                    <Dropdown
                        visible={isVisibleUserPanel}
                        placement={'bottomRight'}
                        trigger={['click', 'hover']}
                        overlay={overlayDropdownUsers}
                        onVisibleChange={(visible) => {
                            this.setState({
                                isVisibleUserPanel: visible,
                                ...visible && {
                                    isVisibleMessagePanel: false
                                }
                            });
                        }}
                        // overlayStyle={{ paddingTop: 20 }}
                    >
                        <div className={classNamesStyles('welcome-word', 'clickable')}>
                            <span style={{ display: 'inline-block' }}>你好{name && `，${name}` || ''}</span>
                            <Icon component={SvgShapeMan} style={{ marginLeft: 5, marginTop: 5 }}/>
                        </div>
                    </Dropdown>

                    {/* <Tooltip title={'安全登出'} placement={'bottom'}>
                        <span style={{ paddingTop: 2 }} className={styles['clickable']} onClick={this.logout}>
                            <Icon component={IconSignOutRegular}/>
                        </span>
                    </Tooltip> */}
                </div>
            </div>
        );
    }
}

export default LayoutHeaderRight;
