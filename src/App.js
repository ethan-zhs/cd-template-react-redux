// React , Redux , Router
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { createBrowserHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';

import { LocaleProvider } from 'antd';

// store
import createApplicationStore from './store/createApplicationStore';
import modelAccount from './models/account';
import modelGlobal from './models/global';

// routes
import RoutesForApp from './router/RoutesForApp';

// HMR
import { hot } from 'react-hot-loader/root';
import { dispatch } from '@utils/_react_redux_saga_fw/createModel';

// ----------------------------------------------------------------------

// configureStore
const initialState = {};
export const history = createBrowserHistory();
export const store = createApplicationStore(initialState, history);

// syncHistoryWithStore
syncHistoryWithStore(history, store, {
    selectLocationState: state => state.get('routing')
});

// App
const App = ({ locale }) => (
    <LocaleProvider locale={locale}>
        <Provider key={module.hot ? new Date() : void 0} store={store}>
            <Router history={history}>
                <RoutesForApp store={store}/>
            </Router>
        </Provider>
    </LocaleProvider>
);

// hot app (HMR)
export default hot(App);
