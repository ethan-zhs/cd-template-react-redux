import React from 'react';
import imgPlaceholder from './img-placeholder.png';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

export default function () {
    return <div className={classNamesStyles('page-as-panel-base', 'fill', 'page-blank-developing')}>
        <div style={{ display: 'inline-block', userSelect: 'none', pointerEvents: 'none' }}>
            <img src={imgPlaceholder} width={350} height={220}/>
        </div>
    </div>;
}
