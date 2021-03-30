import React, { useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

export default React.forwardRef((props, ref) => {
    return (
        <Scrollbars {...props} ref={ref}>
            {props.children}
        </Scrollbars>
    );
});
