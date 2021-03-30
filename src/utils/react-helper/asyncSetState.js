import * as R from 'ramda';

export default R.curry((self, nextState) => {
    return new Promise(resolve => {
        try {
            self.setState(nextState, _ => resolve(self.state));
        } catch (error) {
            self.state = { ...self.state, ...nextState };
            resolve(self.state);
        }
    });
});
