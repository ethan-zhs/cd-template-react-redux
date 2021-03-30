import moment from 'moment';

export default current => {
    return current.isAfter(moment(Date.now()));
};

export const isAfterToday = current => {
    return current.isAfter(moment(Date.now()).endOf('day'));
};

