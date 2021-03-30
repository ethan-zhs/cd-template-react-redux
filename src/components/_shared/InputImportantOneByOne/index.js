import * as R from 'ramda';
import React from 'react';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

export default class InputImportantOneByOne extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indexFocusing: -1,
            mappingIndexToValue: {}
        };
    }
    componentDidMount() {
        const { autoFocus } = this.props;
        if (autoFocus) {
            const elementNextInputElement = R.path([0, 'current'], this.selfInputElementRefs);
            if (elementNextInputElement) {
                this.setState({ indexFocusing: 0 });
                elementNextInputElement.focus();
            }
        }
    }

    _CheckEmitOnChange = _ => {
        const {
            length = 6,
            onChange = _ => null
        } = this.props;

        const times = R.times(R.identity, length);
        const valuesAll = times.map((_, i) => this.state.mappingIndexToValue[i] || null);

        onChange(valuesAll);
    }
    _handleFocus = index => _ => {
        this.setState({ indexFocusing: index });
    }
    _handleBlur = index => _ => {
        this.setState({ indexFocusing: -1 });
    }
    _handleInput = index => async event => {
        const { nativeEvent } = event;
        // const { data } = nativeEvent;

        const targetValue = nativeEvent.target.value;

        nativeEvent.target.value = '';

        const {
            length = 6,
            onComplete = _ => null
        } = this.props;

        const valueLast = this.state.mappingIndexToValue[index];

        if (((length - 1) === index) && !!valueLast) {
            return false;
        }

        this.setState({
            mappingIndexToValue: {
                ...this.state.mappingIndexToValue,
                [index]: targetValue.substr(0, 1)
            }
        }, _ => {
            this._CheckEmitOnChange();
        });

        const elementCurrentInputElement = R.path([index, 'current'], this.selfInputElementRefs);

        const elementNextInputElement = R.path([index + 1, 'current'], this.selfInputElementRefs);

        if (elementNextInputElement) {
            elementCurrentInputElement.blur();
            this.setState({ indexFocusing: index + 1 }, _ => {
                setTimeout(_ => {
                    elementNextInputElement.focus();
                }, 100);
            });
        }
    }
    _handleKeyUp = index => async event => {
        const {
            length = 6,
        } = this.props;
        const { nativeEvent } = event;

        if (nativeEvent.keyCode === 8 || nativeEvent.keyCode === 46) {
            nativeEvent.target.value = '';

            const valueLast = this.state.mappingIndexToValue[index];

            this.setState({
                mappingIndexToValue: {
                    ...this.state.mappingIndexToValue,
                    [index]: null
                }
            }, _ => {
                this._CheckEmitOnChange();
            });

            if (((length - 1) === index || index === 0) && !!valueLast) {
                this.setState({ indexFocusing: index });
                return false;
            }

            const elementNextInputElement = R.path([index - 1, 'current'], this.selfInputElementRefs);

            this.setState({ indexFocusing: Math.max(0, index - 1) });

            if (elementNextInputElement) {
                elementNextInputElement.focus();
            }
        }
    }
    render() {
        const {
            length = 6,
            className = ''
        } = this.props;

        const {
            indexFocusing,
            mappingIndexToValue = {}
        } = this.state;

        const times = R.times(R.identity, length);

        this.selfInputElementRefs = times.map(_ => React.createRef());

        return <div className={[classNamesStyles('component'), className || ''].join(' ')}>
            <div className={classNamesStyles('content-component')}>
                {times.map((_, index) => {
                    const value = mappingIndexToValue[index];
                    return <label key={index} className={classNamesStyles('item', {
                        isFocusing: indexFocusing === index,
                        hasValue: Boolean(value)
                    })}>
                        <input
                            // value={''}
                            ref={this.selfInputElementRefs[index]}
                            onInput={this._handleInput(index)}
                            onFocus={this._handleFocus(index)}
                            onBlur={this._handleBlur(index)}
                            onKeyUp={this._handleKeyUp(index)}
                            // onChange={_ => null}
                            maxLength={1}
                            autoComplete={'off'}
                            autoFocus={false}
                            aria-autocomplete={'none'}
                            type="tel"
                            style={{ imeMode: 'disabled' }}
                        />
                        <div className={classNamesStyles('value-item')}>{value}</div>
                    </label>;
                })}
            </div>
        </div>;
    }
}
