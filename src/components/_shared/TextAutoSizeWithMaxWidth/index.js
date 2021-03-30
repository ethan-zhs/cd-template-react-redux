import React from 'react';
import getCharLength from '@utils/string-helper/getCharLength';

const classNamesStyles = require('classnames/bind').bind(require('./index.less'));

function SvgText(props) {
    const {
        offsetSvgTextX = 0,
        offsetSvgTextY = 5
    } = props;
    return <svg
        style={{ verticalAlign: 'top', userSelect: 'none' }}
        width={props.width}
        height={props.height}
    >
        <text
            className={classNamesStyles('textInSvg')}
            fill={props.fontColor}
            x={`${50 + offsetSvgTextX}%`}
            y={`${50 + offsetSvgTextY}%`}
            fontSize={props.fontSizeExpect}
            dominantBaseline="middle"
            textAnchor="middle"
        >
            {props.text}
        </text>
    </svg>;
}

export default class TextAutoSizeWithMaxWidth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOverHeight: false,
            fontSizeExpect: 12,
            refWrapper: React.createRef(),
            refTextPlaceholder: React.createRef()
        };
    }
    static getDerivedStateFromProps(props, state) {
        const { text } = props;
        const eleTextPlaceholder = state?.refTextPlaceholder?.current;
        if (!eleTextPlaceholder) {
            return state;
        }
        const eleWrapper = state?.refWrapper?.current;
        const rectWrapper = {
            width: eleWrapper.offsetWidth,
            height: eleWrapper.offsetHeight
        };
        const rectEleTextPlaceholder = eleTextPlaceholder.getBoundingClientRect();
        const rectTextPlaceholder = {
            width: Math.max(rectEleTextPlaceholder.width, eleTextPlaceholder.offsetWidth),
            height: Math.max(rectEleTextPlaceholder.height, eleTextPlaceholder.offsetHeight),
        };
        const {
            lineHeight,
            fontSize,
            color
        } = getComputedStyle(eleTextPlaceholder);
        // const pxLineHeight = Math.min(rectTextPlaceholder.height, lineHeight);

        const fontSizeExpect = rectWrapper.width / getCharLength(`${text}`);
        // console.log(
        //     'eleTextPlaceholder.offsetHeight > rectWrapper.height',
        //     eleTextPlaceholder.offsetHeight, rectWrapper.height
        // );
        // const pxLineHeight = parseInt(lineHeight);
        const pxLineHeight = parseInt(lineHeight, 10);

        return {
            ...state,
            pxLineHeight,
            isOverHeight: eleTextPlaceholder.offsetHeight > rectWrapper.height ||
                rectTextPlaceholder.width > pxLineHeight,
            fontSizeExpect: fontSizeExpect,
            fontColor: color,
            widthTextContainer: rectTextPlaceholder.width,
            heightTextContainer: lineHeight,
            rectTextPlaceholderHeight: rectTextPlaceholder.height,
            rectWrapperWidth: rectWrapper.width
        };
    }
    componentDidMount() {
        this.setState(
            TextAutoSizeWithMaxWidth.getDerivedStateFromProps(this.props, this.state)
        );
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.text !== this.props.text) {
            setTimeout(() => {
                this.setState(
                    TextAutoSizeWithMaxWidth.getDerivedStateFromProps(this.props, this.state)
                );
            }, 100);
        }
    }
    render() {
        const {
            text,
            style = null,
            maxWidth = '100%',
            minFontSize = false,
            noWrap = false,
            // lineHeight = 12,
            wrapperClassName = '',
        } = this.props;

        const {
            isOverHeight = false,
            fontSizeExpect,
            fontColor,
            // widthTextContainer,
            // heightTextContainer,
            rectTextPlaceholderHeight,
            rectWrapperWidth,
            pxLineHeight
        } = this.state;

        const isHiddenPlaceholderOverHeight = isOverHeight && noWrap;

        return <div
            ref={this.state.refWrapper}
            className={`${classNamesStyles('component')} ${wrapperClassName}`}
            style={{
                height: pxLineHeight,
                display: 'inline-block',
                maxWidth,
                ...style,
            }}
        >
            {!!isHiddenPlaceholderOverHeight &&
                <span style={{ display: 'inline-block', height: pxLineHeight }}/>
            }
            <span ref={this.state.refTextPlaceholder} className={classNamesStyles({
                hiddenPlaceholderOverHeight: isHiddenPlaceholderOverHeight
            })} style={{
                display: 'inline-block',
                // maxWidth: '100%',
                // maxHeight: '100%',
                ...isOverHeight && {
                    fontSize: minFontSize ? Math.max(Number(minFontSize), fontSizeExpect) : fontSizeExpect,
                    worldBreak: 'break-all',
                }
            }}>{text}</span>
            {isHiddenPlaceholderOverHeight && <SvgText
                key={fontSizeExpect}
                width={rectWrapperWidth}
                height={Math.max(pxLineHeight, fontSizeExpect + 1)}
                text={text}
                fontColor={fontColor}
                fontSizeExpect={fontSizeExpect}
            />}
        </div>;
    }
}
