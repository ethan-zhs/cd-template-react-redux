import * as R from 'ramda';
import React from 'react';
import prefixAll from 'inline-style-prefix-all';
import SelectableElementBoundingClientRect from '@components/_common/SelectableElementBoundingClientRect';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

export default class TabGroup extends SelectableElementBoundingClientRect {
    static getDerivedStateFromProps(props, state) {
        const {
            options = [],
            value = null,
        } = props;
        return {
            refOptionItems: options.map(_ => React.createRef()),
            ...R.not(R.isNil(value)) && {
                indexSelected: R.findIndex(R.propEq(0, value), options)
            }
        };
    }
    render() {
        const {
            options = [],
            split = '/',
            className,
            style
        } = this.props;

        const {
            selectedPosition = {},
            selectedSize = {},
            indexSelected = -1
        } = this.state;

        return <div className={classNamesStyles('component', className)} style={style}>
            <div className={classNamesStyles('options')} ref={this.state.refOptions}>
                {options.map(([id, name], index) => {
                    return <React.Fragment key={`${id}-${index}`}>
                        {index > 0 && <span>{split}</span>}
                        <div
                            className={classNamesStyles('item', {
                                selected: index === indexSelected
                            })}
                            ref={this.state.refOptionItems[index]}
                            onClick={this.handleSelect(index)}
                        >{name}</div>
                    </React.Fragment>;
                })}
            </div>
            <div className={classNamesStyles('selectedBottomMarkerWrapper')} style={prefixAll({
                transform: `translate3d(${selectedPosition.x}px, 0, 0)`,
                opacity: (indexSelected >= 0) ? 1 : 0
            })}>
                <div className={classNamesStyles('selectedBottomMarker')} style={prefixAll({
                    width: selectedSize.w * 0.8,
                    marginLeft: -(selectedSize.w * 0.8) / 2
                })}/>
            </div>
        </div>;
    }
}
