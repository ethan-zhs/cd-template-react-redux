import React from 'react';

export default class Noop extends React.Component {
    render() {
        return null;
    }

    static Span = class Span extends React.Component {
        render() {
            return <span/>;
        }
    }

    static TableHead = class Span extends React.Component {
        render() {
            return <thead/>;
        }
    }
}
