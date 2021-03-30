import * as R from 'ramda';
import React from 'react';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';
import model from './model';
import BreadcrumbSkined from '@components/_shared/BreadcrumbSkined';

@createModuleInjectorBy(model)
class PageA extends React.Component {
    async componentDidMount() {
        await this.props.getDetail({ id: R.prop('id', this.props.params) });
    }
    render() {
        const { detail, params, fromPathname } = this.props;
        return <div>
            <BreadcrumbSkined dataSource={[
                ['PageA', { to: fromPathname } ],
                ['详情']
            ]} />
            <div>{detail}{R.prop('id', params)}</div>
        </div>;
    }
}

export default PageA;
