import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, Popover } from 'antd';
import RadioButtonGroup from '../../../../components/_shared/RadioButtonGroupProjectScope';

export default function (props) {
    const {
        canXXX,
        classNamesLess,
        match,
        list,
        getPathnameCurrentRoute
    } = props;

    return <div className={classNamesLess('page-a')}>
        Page: {match.params.id}
        <Button className={classNamesLess('btn')} onClick={props.getList}>getList</Button>
        {canXXX && <Button onClick={_ => null}>xxx</Button>}
        <ul>
            {list.map(i => <li key={i}><Link to={{
                pathname: `${getPathnameCurrentRoute()}/detail/${i}`,
                state: { fromPathname: getPathnameCurrentRoute() }
            }}>item-{i}</Link></li>)}
        </ul>
        <Divider/>
        <RadioButtonGroup
            initialIndexSelected={0}
            options={[
                ['1', '累计用户'],
                ['2', '新增用户'],
                ['3', '日均活跃用户']
            ]}
        />
    </div>;
}
