import React, { PureComponent } from 'react';
import { Select, Button, Divider, Checkbox, Empty, Icon, message } from 'antd';
import * as R from 'ramda';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './index.less';
import AREA_CODE_TO_NAME from '@constants/areaCodeToName';

const CheckboxGroup = Checkbox.Group;

export default class AreaSelectNoData extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            selectName: []
        };
    }
    handleChangeArea = (value) => {
        const { selectName } = this.state;
        if (R.includes(value, selectName)) {
            this.setState({ selectName: [ ...selectName.filter((item) => (item !== value)) ] });
        } else {
            if (selectName.length >= 5) {
                message.error('最多选择5个！');
            }
            if (selectName.length < 5) { this.setState({ selectName: [ ...selectName, value ] }); }
        }
    }
    handleCancel = () => {
        const { value } = this.props;
        this.setState({
            open: false,
            selectName: value
        });
    }
    handleSure = async () => {
        const { onChange } = this.props;
        const { selectName } = this.state;
        onChange && await onChange(selectName);
        await this.handleCancel();
    }
    render() {
        const {
            style = {},
            placeholder = '选择区域对比',
            suffixIcon = <Icon type="caret-down" />,
            onChange = _ => null,
            allowClear = true,
            areaTreeData = [],
            value = []
        } = this.props;
        const { selectName, open } = this.state;
        return <div style={style} className={styles.container}
            onMouseDown={(e) => {
                e.preventDefault();
                return false;
            }}
        >
            <div className={styles['selct-areas']} >
                {value?.length ? R.props(value, AREA_CODE_TO_NAME).join(',') : placeholder }
            </div>
            <Select
                suffixIcon={suffixIcon}
                placeholder={'请选择'}
                className={styles.select}
                value={R.isEmpty(selectName) ? void 0 : '0'}
                allowClear={allowClear}
                dropdownMatchSelectWidth={false}
                getPopupContainer={() => document.querySelector('.' + styles.select)}
                open={open}
                onDropdownVisibleChange={async (isOpen) => {
                    if (isOpen) {
                        await this.setState({ selectName: value });
                    }
                    await this.setState({ open: isOpen });
                }}
                onChange={value => {
                    if (value) { return null; }
                    this.setState({
                        selectName: []
                    });
                    onChange([]);
                }}
                dropdownRender={menu => (
                    <div className={styles['select-dropdown']} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}>
                        <div className={styles.city}>
                            <Scrollbars ref={this.refCityScrollBar} style={{ height: 'calc(100%)' }}>
                                {areaTreeData.length ? <CheckboxGroup style={{ width: '100%' }} value={[...selectName]}>
                                    <div className={styles.list}>
                                        {areaTreeData.map(item => (<div key={item[0]} onClick={() => this.handleChangeArea(item[0])}>
                                            <Checkbox
                                                value={item[0]}
                                                className={styles.checkbox}
                                            >
                                                {item[1]}
                                            </Checkbox>
                                        </div>))}
                                    </div>
                                </CheckboxGroup> : <div className={styles.empty}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>}
                            </Scrollbars>
                        </div>
                        <Divider style={{ margin: 0 }} />
                        <div className={styles.footer} >
                            <div className={styles['btn-group']} >
                                <Button onClick={() => this.handleCancel()} className={styles.cancel}>取消</Button>
                                <Button disabled={selectName.length == 0} onClick={() => this.handleSure()} type={'primary'}>确定</Button>
                            </div>
                        </div>
                    </div>
                )}
            >
                <Select.Option value={'0'}>广东省</Select.Option>
            </Select>
        </div>;
    }
}
