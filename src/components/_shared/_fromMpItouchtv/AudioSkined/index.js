import React, { Component } from 'react';

import styles from './index.less';

class AudioSkined extends Component {
    constructor(props) {
        super(props);

        this.timer = null;
        this.id = null;

        this.state = {
            isPlaying: false,
            currTime: '00:00',
            duration: '00:00',
            buffered: '0%',
            progress: '0%',
            pointX: 0,
            actualLeft: 0
        };
    }

    componentDidMount() {
        // 初始化播放时长，和播放器事件
        this.getDuration();

        // 初始化拖拽事件
        this.initListenTouch();
    }


    render() {
        const { audioUrl, id, audioTitle } = this.props;

        return (
            <section className={styles['audio-out-div']} ref={audio => { this.audioBox = audio; }}>
                <section className={`${styles['audio-play-btn']} ${styles[this.state.isPlaying ? 'audio-playing' : 'audio-play']}`} onClick={this.playAudio}></section>
                <section className={styles['audio-msg']}>
                    <p className={styles['audio-title']}>{audioTitle}</p>
                    <section className={styles['audio-time-slidebar']} onClick={this.clickSidebar} ref={slide => { this.slide = slide; }}>
                        <section className={styles['audio-time-buffered']} style={{ width: this.state.buffered }}></section>
                        <section className={styles['audio-time-progress']} style={{ width: this.state.progress }}>
                            <section className={styles['audio-time-point']} ref={point => { this.audioPoint = point; }}></section>
                        </section>
                    </section>
                    <section className={styles['audio-time']}>
                        <span className={styles['audio-js-curr-time']}>{this.state.currTime}</span>
                        <span className={styles['audio-js-total-time']}>{this.state.duration}</span>
                    </section>
                </section>
                <audio controls id={id} src={audioUrl} ref={audio => { this.audioEl = audio; }} type='video/mp4' />
            </section>
        );
    }


    // 播放/停止音频
    playAudio = () => {
        if (this.state.isPlaying) {
            this.audioEl.pause();
        } else {
            this.audioEl.play();
        }
    }


    /**
     *
     * 改变当前播放器播放状态
     *
     * @param [boolean] value [设置播放状态]
     */
    playStatusChange = (value) => {
        if (!value) {
            clearInterval(this.timer);
            this.setState(Object.assign({}, this.state, {
                isPlaying: false
            }));
        } else {
            this.timeUpdate();
            this.setState(Object.assign({}, this.state, {
                isPlaying: true,
                progress: this.state.progress == '100%' ? '0%' : this.state.progress
            }), () => {
                this.audioEl.ontimeupdate = () => {
                    if (this.audioEl.readyState == 4 && this.state.buffered != '100%') {
                        this.setState(Object.assign({}, this.state, {
                            buffered: Math.round(this.audioEl.buffered.end(0) / this.audioEl.duration * 100) + '%'
                        }));
                    }
                };
            });
        }
    }


    // 初始化播放时长 / 播放器事件监听
    getDuration = () => {
        const getd = setInterval(() => {
            const { duration } = this.audioEl;
            if (!Number.isNaN(duration)) {
                const durationNum = this.formatPlayTime(duration);

                // 获得进度条到浏览器最左边的距离
                const actualLeft = this.slideLeftDistance();
                this.setState(Object.assign({}, this.state, {
                    duration: durationNum,
                    actualLeft: actualLeft
                }));
                clearInterval(getd);

                this.audioPlayListener();
            }
        }, 10);
    }


    // 获得slide到浏览器左边的距离
    slideLeftDistance = () => {
        let actualLeft = this.slide.offsetLeft;
        let current = this.slide.offsetParent;

        while (current) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }

        return actualLeft;
    }


    // 播放器事件监听
    audioPlayListener = () => {
        const { playMedia, id } = this.props;

        this.audioEl.addEventListener('play', (event) => {
            this.playStatusChange(true);
            playMedia(id);
        });

        this.audioEl.addEventListener('pause', (event) => {
            this.playStatusChange(false);
        });

        this.audioEl.addEventListener('ended', (event) => {
            this.playStatusChange(false);
        }, true);
    }


    /**
     *
     * 设置当前播放进度 / 和播放时间
     *
     * @param [number] currPercent [当前播放进度比例]
     */
    setCurrTime = (currPercent) => {
        this.audioEl.currentTime = this.audioEl.duration * currPercent;
        console.log(currPercent, this.audioEl.currentTime);
        const currTime = this.formatPlayTime(this.audioEl.currentTime);

        this.setState(Object.assign({}, this.state, {
            currTime: currTime,
            progress: (currPercent * 100) + '%'
        }));
    }


    // 记录实时播放进度
    timeUpdate = () => {
        this.timer = setInterval(() => {
            const { currentTime = 0, duration = 0 } = this.audioEl;

            const currTime = this.formatPlayTime(currentTime);

            this.setState(Object.assign({}, this.state, {
                currTime: currTime,
                progress: duration == 0 ? '0%' : currentTime / duration * 100 + '%'
            }));

            if (currentTime == duration || duration == 0) {
                clearInterval(this.timer);
            }
        }, 1000);
    }


    /**
     *
     * 格式化播放时间
     *
     * @param [number] time [传入时间秒]
     */
    formatPlayTime = (time) => {
        const minute = parseInt(time / 60, 10);
        const second = parseInt(time % 60, 10);

        const timeArr = [minute, second].map(item => (item < 10 ? '0' + item : item));
        return timeArr.join(':');
    };


    /**
     *
     * 点击进度条修改播放进度
     *
     * @param [object] e [当前点击对象]
     */
    clickSidebar = (e) => {
        const clickWidth = e.pageX - this.state.actualLeft;
        const slideBarWidth = this.slide.offsetWidth;
        this.setCurrTime(clickWidth / slideBarWidth);
    }


    // 监听拖动进度按下按钮事件
    initListenTouch = () => {
        this.audioPoint.addEventListener('mousedown', this.pointStart, false);
    }


    /**
     *
     * 按下按钮
     *
     * @param [object] e [当前点击对象]
     */
    pointStart = (e) => {
        e.preventDefault();
        this.state.isPlaying && (this.id = this.props.id);
        this.audioEl.pause();
        // 为了更好的体验，在移动触点的时候我选择将音频暂停
        this.setState(Object.assign({}, this.state, {
            isPlaying: false, // 播放按钮变更
            pointX: e.pageX // 进度触点在页面中的x坐标
        }));

        this.audioBox.addEventListener('mousemove', this.pointMove, false);
        document.addEventListener('mouseup', this.pointEnd, false);
    }


    /**
     *
     * 拖动按钮
     *
     * @param [object] e [当前点击对象]
     */
    pointMove = (e) => {
        e.preventDefault();
        // const x = e.pageX - this.state.pointX; // 滑动的距离
        const maxMove = this.slide.clientWidth; // 最大的移动距离不可超过进度条宽度

        // 下面是触点移动时会碰到的情况，分为正移动、负移动以及两端的极限移动。
        if (e.pageX - this.state.actualLeft >= maxMove) {
            this.setCurrTime(1);
        } else if (e.pageX <= this.state.actualLeft) {
            this.setCurrTime(0);
        } else {
            const moveWidth = e.pageX - this.state.actualLeft;
            this.setCurrTime(moveWidth / maxMove);
        }
    }


    // 放开按钮
    pointEnd = () => {
        this.audioBox.removeEventListener('mousemove', this.pointMove, false);
        this.audioBox.removeEventListener('mouseup', this.pointEnd, false);
        if (this.id == this.props.id) {
            this.audioEl.play();
            this.id = null;
        }
    }
}

export default AudioSkined;
