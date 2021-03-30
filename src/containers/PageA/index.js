import * as R from 'ramda';
import React from 'react';
import { createModuleInjectorBy } from '@utils/_react_redux_saga_fw/createModel';
import classNames from 'classnames/bind';
import model from './model';
import stylesLess from './index.less';
import { Switch, Route, Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import Authorized from '@components/_shared/Authorized';
import RouteSub from './routes/detail';
import RouteIndex from './routes/index/index.js';

const classNamesLess = classNames.bind(stylesLess);

@createModuleInjectorBy(model)
class PageA extends React.Component {
    // constructor(props) {
    //     super(props);
    // }
    render() {
        const {
            match,
            list,
            getPathnameCurrentRoute,
            getList
        } = this.props;
        return <Authorized
            authKeys={[
                ['canXXX', 'auth_key_xxx']
            ]}
            render={({ canXXX }) => {
                return <Switch>
                    <Route path={`${getPathnameCurrentRoute({ type: 'detail' })}/:id`} render={propsRoute => {
                        const params = R.path(['match', 'params'], propsRoute);
                        return <RouteSub classNamesLess={classNamesLess} params={params}/>;
                    }}/>
                    <Route path={getPathnameCurrentRoute()} render={_ => (
                        <RouteIndex
                            getList={getList}
                            canXXX={canXXX}
                            classNamesLess={classNamesLess}
                            match={match}
                            list={list}
                            getPathnameCurrentRoute={getPathnameCurrentRoute}
                        />
                    )}/>
                    <Route path={'*'} render={_ => <Redirect to={getPathnameCurrentRoute()} />}/>
                </Switch>;
            }}
        />;
    }
}

export default PageA;
