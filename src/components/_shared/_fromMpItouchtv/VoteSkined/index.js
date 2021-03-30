import React, { Component } from 'react';
import stylesLess from './index.less';
import classNames from 'classnames/bind';
import { Divider, Button, message } from 'antd';

const styles = classNames.bind(stylesLess);

class VoteSkined extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: require('@assets/statics/images/time.png'),
            data: require('@assets/statics/images/data.png')
        };
    }
    toVote = () => {
        message.warning('请到对应的平台进行投票操作！');
    }
    timeFormat = (time) => {
        const endTime = new Date(time);
        const month = endTime.getMonth() + 1;
        const date = endTime.getDate();
        const hour = endTime.getHours();
        const minute = endTime.getMinutes();
        const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const endTimeStr = `${month}月${date}日（${weekDay[endTime.getDay()]}） ${hour} : ${minute}`;
        return endTimeStr;
    }
    typeFormat = (type, voteType, voteTypeVoteCount) => {
        const voteTypeArr = ['每人限投一次', '每天可投一次', `每人每天可投${voteTypeVoteCount}票`, `每人限投${voteTypeVoteCount}票`];
        if (voteType == 2 || voteType == 3) {
            return voteTypeArr[voteType];
        }
        if (voteType == 0 || voteType == 1) {
            const typeText = (type == 0) ? '单选' : '多选';
            return `${typeText} / ${voteTypeArr[voteType]}`;
        }
    }
    render() {
        const { time, data } = this.state;
        const { vote } = this.props;
        return (
            <div className={styles('container')}>
                <p className={styles('title')}>{vote.title || '-'}</p>
                <p className={styles('type')}><img src={data} />{this.typeFormat(vote.type, vote.voteType, vote.voteTypeVoteCount)}</p>
                <p className={styles('endTime')}><img src={time} />截止日期：{this.timeFormat(vote.endTime)}</p>
                <Divider className={styles('divider')} />
                <div className={styles('voteOptions')}>
                    {vote.voteOptions.map((item, index) => (
                        <p key={item.voteOptionPk || index}>{item.content}</p>
                    ))}
                </div>
                <Button className={styles('btn')} block type='primary' ghost onClick={this.toVote}>投票</Button>
            </div>
        );
    }
}

export default VoteSkined;
