import * as R from 'ramda';
import React from 'react';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';
import model from './model';
import asyncSetState from '@utils/react-helper/asyncSetState';
import { Spin } from 'antd';


@createModuleInjectorBy(model)
export default class PageB extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isFetchingInitial: true };
    }
    async componentDidMount() {
        await asyncSetState(this, { isFetchingInitial: true });
        await this.props.getListForTable();
        await asyncSetState(this, { isFetchingInitial: false });
    }
    getListForTable = async formFields => {
        await this.props.getListForTable();
    }
    render() {
        return <Spin spinning={this.state.isFetchingInitial}>
            <div>PageB</div>
        </Spin>;
    }
}
