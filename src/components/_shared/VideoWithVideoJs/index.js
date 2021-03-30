import * as R from 'ramda';
import React from 'react';
import classNamesRaw from './index.less';
import mime from 'mime-types';
import '@assets/vendor/video-js.min.css';
import '@assets/vendor/videojs-vjsdownload.css';
import videojs from 'video.js';
import url from 'url';

const isFirefox = navigator.userAgent.toLowerCase().match(/firefox/i);

window.videojs = videojs;

require('@assets/vendor/videojs-flash.js');

require('@assets/vendor/videojs-contrib-hls.js');

require('@assets/vendor/videojs-vjsdownload.js');

videojs.addLanguage('zh-CN', {
    'No compatible source was found for this media.': '视频未播放',
    'The media could not be loaded, either because the server or network failed or because the format is not supported.': '该视频地址无法访问或格式在当前浏览器不支持播放',
});

export default class VideoWithVideoJs extends React.Component {
    constructor(props) {
        super(props);
        this.refVideoElement = React.createRef();
    }
    componentDidMount() {
        const {
            width,
            height,
            src,
            type,
            forceSameProtocol,
            title,
            ...propsRest
        } = this.props;

        const parsedSrc = url.parse(src);
        const now = (+Date.now());
        // 消除大文件浏览器缓存

        const sources = (Array.isArray(src) ? src : [src]).map(srcRaw => {
            // const refreshBroswerCacheQuery = `${parsedSrc && parsedSrc.search ? parsedSrc.search + '&r=' + now : '?r=' + now}`;
            let srcFinal = srcRaw;

            if (forceSameProtocol) {
                if (parsedSrc.protocol !== window.location.protocol) {
                    srcFinal = window.location.protocol + '//' + parsedSrc.host + '/' + parsedSrc.path + (parsedSrc.search || ''); // + refreshBroswerCacheQuery;
                }
            }

            return {
                src: srcFinal,
                type: mime.lookup(parsedSrc.pathname) || void 0
            };
        });

        this.player = videojs(this.refVideoElement.current, {
            preload: 'auto',
            language: 'zh-CN',
            sources: [...sources],
            // techOrder: ['flash', 'html5'],
            ...propsRest,
            controlBar: {
                fullscreenToggle: true,
                pictureInPictureToggle: false,
                ...propsRest.controlBar || null
            },
            plugins: {
                vjsdownload: {
                    beforeElement: 'playbackRateMenuButton',
                    textControl: 'Download video',
                    name: 'downloadButton',
                    downloadURL: R.head(sources).src,
                    className: isFirefox && 'vjs-firefox',
                    title: title
                }
            }
        });
        // this.player.play();
    }
    componentWillUnmount() {
        if (this.player) { this.player.dispose(); }
    }
    render() {
        const {
            className = '',
            style,
            widthVideo = 600,
            heightVideo = 300
        } = this.props;
        return <div className={`${classNamesRaw.component} ${className}`} style={style}>
            <div data-vjs-player={true} style={{ maxWidth: '100%' }}>
                <video
                    ref={this.refVideoElement}
                    controls={true}
                    id={'test-video'}
                    className={'video-js vjs-default-skin vjs-big-play-centered'}
                    width={widthVideo}
                    height={heightVideo}
                />
            </div>
        </div>;
    }
}
