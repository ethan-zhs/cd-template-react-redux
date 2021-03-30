export default function(timeRange, coupleKeys) {
    const [lKey, rKey] = coupleKeys;
    const [lTime, rTime] = timeRange || [];
    return (lTime && rTime) ? {
        [lKey]: lTime.valueOf(),
        [rKey]: rTime.valueOf()
    } : {};
}

export function destructTimeRangeByDay(timeRange, coupleKeys) {
    const [lKey, rKey] = coupleKeys;
    const [lTime, rTime] = timeRange || [];
    return (lTime && rTime) ? {
        [lKey]: lTime.startOf('day').valueOf(),
        [rKey]: rTime.endOf('day').valueOf()
    } : {};
}

export function destructTimeRangeAsFormat(format, timeRange, coupleKeys) {
    const [lKey, rKey] = coupleKeys;
    const [lTime, rTime] = timeRange || [];
    return (lTime && rTime) ? {
        [lKey]: lTime.format(format),
        [rKey]: rTime.format(format)
    } : {};
}
