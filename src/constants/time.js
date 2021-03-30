import moment from 'moment';

export const TIME_RANGE_DEFAULT_FOR_BEGIN_END = _ => [moment().subtract({ day: 3 }).startOf('day'), moment().endOf('day')];

export const TIME_RANGE_DEFAULT_FOR_BEGIN_END_1MONTH = _ => [moment().subtract({ month: 1 }).startOf('day'), moment().endOf('day')];
