import * as R from 'ramda';
import React from 'react';

export default class SelectableElementBoundingClientRect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refOptionItems: [],
            indexSelected: props.initialIndexSelected,
            selectedPosition: { x: 0, y: 0 },
            selectedSize: { w: 0, h: 0 },
            refOptions: React.createRef(),
        };
    }
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
    componentDidMount() {
        const { indexSelected } = this.state;
        if (indexSelected >= 0) {
            this._updateSelectedPosition(indexSelected, true);
        }
    }
    shouldComponentUpdate(nextProps, nextState, _) {
        if (this.state.indexSelected !== nextState.indexSelected) {
            this._updateSelectedPosition(nextState.indexSelected);
        }
        return true;
    }
    _updateSelectedPosition = (index, isInitial = false) => {
        const eleOptions = R.path(['current'], this.state.refOptions);

        const eleTargetItem = R.path(
            [index, 'current'], this.state.refOptionItems
        );

        if (!eleTargetItem) { return null; }

        const rectOptions = eleOptions.getBoundingClientRect();
        const rectTargetItem = eleTargetItem.getBoundingClientRect();

        const { indexSelected } = this.state;

        const xRectTargetItem = R.isNil(rectTargetItem.x) ? rectTargetItem.left : rectTargetItem.x;
        const yRectTargetItem = R.isNil(rectTargetItem.y) ? rectTargetItem.top : rectTargetItem.y;

        const xRectOptions = R.isNil(rectOptions.x) ? rectOptions.left : rectOptions.x;
        const yRectOptions = R.isNil(rectOptions.y) ? rectOptions.top : rectOptions.y;

        const xTargetItem = xRectTargetItem - xRectOptions + (rectTargetItem.width / 2);
        const yTargetItem = yRectTargetItem - yRectOptions + (rectTargetItem.height / 2);

        // console.log('xTargetItem', xRectOptions, yRectOptions, rectTargetItem.width);

        if (indexSelected < 0 || isInitial) {
            this.setState({
                selectedPosition: { x: xTargetItem, y: yTargetItem },
            }, _ => {
                setTimeout(_ => {
                    this.setState({
                        selectedSize: { w: rectTargetItem.width, h: rectTargetItem.height }
                    });
                }, 100);
            });
        } else {
            this.setState({
                selectedPosition: { x: xTargetItem, y: yTargetItem },
                selectedSize: { w: rectTargetItem.width, h: rectTargetItem.height }
            });
        }

        this.setState({ indexSelected: index });
    }
    async protectedDidSelect(index) {
        const {
            options = [],
            onChange = _ => null
        } = this.props;

        const value = R.path([index, 0], options);

        await onChange(value);

        this.setState({ indexSelected: index });
    }
    handleSelect = index => async _ => {
        await this.protectedDidSelect(index);
    }
}
