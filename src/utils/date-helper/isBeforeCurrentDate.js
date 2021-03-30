import moment from 'moment';

export default current => {
    return current.isBefore(moment(Date.now()));
};

export const isBeforeToday = current => {
    return current.isBefore(moment(Date.now()).startOf('day'));
};

