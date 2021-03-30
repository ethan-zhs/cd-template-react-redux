import * as R from 'ramda';
import React from 'react';
import prefixAll from 'inline-style-prefix-all';
import SelectableElementBoundingClientRect from '@components/_common/SelectableElementBoundingClientRect';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

export default class RadioButtonGroup extends SelectableElementBoundingClientRect {
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
            className,
            style,
            options = []
        } = this.props;

        const {
            selectedPosition = {},
            selectedSize = {},
            indexSelected = -1
        } = this.state;

        return <div className={[classNamesStyles('component'), className].join(' ')} style={style}>
            <div className={classNamesStyles('selectedBackgroundBoxWrapper')} style={prefixAll({
                transform: `translate3d(${selectedPosition.x}px, ${selectedPosition.y}px, 0)`,
                opacity: (indexSelected >= 0) ? 1 : 0
            })}>
                <div className={classNamesStyles('selectedBackgroundBox')} style={prefixAll({
                    width: selectedSize.w,
                    height: selectedSize.h,
                    marginTop: -selectedSize.h / 2,
                    marginLeft: -selectedSize.w / 2
                })}/>
            </div>
            <div className={classNamesStyles('options')} ref={this.state.refOptions}>
                {options.map(([id, name], index) => {
                    return <div
                        key={`${id}-${index}`}
                        className={classNamesStyles('item', {
                            selected: index === indexSelected
                        })}
                        ref={this.state.refOptionItems[index]}
                        onClick={this.handleSelect(index)}
                    >{name}</div>;
                })}
            </div>
        </div>;
    }
}
