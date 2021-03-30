import iScroll from 'iscroll';
import ReactIScroll from 'react-iscroll';
import React from 'react';

export default function(props) {
    const {
        onScrollStart = () => null,
        onScrollEnd = () => null
    } = props;
    return <ReactIScroll
        {...props}
        onScrollStart={onScrollStart}
        onScrollEnd={onScrollEnd}
        iScroll={iScroll}
        options={{
            mouseWheel: true,
            scrollbars: true,
            fadeScrollbars: false,
            ...props.options,
            scrollX: false,
            scrollY: true,
            interactiveScrollbars: true,
            // eventPassthrough: true
        }}
    >{props.children}</ReactIScroll>;
}
