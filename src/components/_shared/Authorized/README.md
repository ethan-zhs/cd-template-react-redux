### Authorized 组件

用来获取当前用户对于多个鉴权 key 的`true`/`false`鉴权状态。

可以将这个组件包裹在在页面组件内，根据需要获取并使用具体 key 的鉴权状态。

##### Example

1)

```jsx static
<Authorized
    authKeys={[['canEdit', 'i_can_edit'], ['canRemove', 'i_can_remove']]}
    render={({ canEdit, canRemove }) => (
        <React.Fragment>
            {canEdit && <Anything to="/xxx/edit">编辑</Anything>}
            {canRemove && (
                <React.Fragment>
                    {canEdit && <span>|</span>}
                    <Anything onClick={this.remove}>删除</Anything>
                </React.Fragment>
            )}
        </React.Fragment>
    )}
/>
```

2)

```jsx static
<Authorized
  authKeys={[
    ['canEdit', 'i_can_edit'],
    ['canAdd', 'i_can_add']
  ]}
  render={({ canEdit, canRemove }) => {
    <Switch>
      <Route path={'/xxx/add'} render={routeProps => {
        if (!canAdd) {
          return <Redirect to="/xxx"/>;
        }
        return <PageAdd/>;
      }}/>
      <Route path={'/xxx/edit'} render={routeProps => {
        if (!canEdit) {
          return <Redirect to="/xxx"/>;
        }
        return <PageEdit/>;
      }}/>
    </Switch>
  }/>
```

3)

```jsx static
<Authorized
  authKeys={[
    ['canBothAddAndEdit', check => check('i_can_edit') && check('i_can_add')]
  ]}
  render={({ canBothAddAndEdit }) => {
    //...
  }/>
```
