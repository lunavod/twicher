//noinspection JSUnresolvedVariable
import _ from 'lodash';
import React from "react";
import classNames from 'classnames';

import ReactQuill from 'react-quill';

import {send, SIGNALS, fetchQuotes} from "./logic";

function formatQuote(quote) {
    return {__html: quote.text};
}
class Quote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: false};
    }

    componentDidMount() {
        this.props.bus
            .filter(
                ({tell}) => {
                    return tell == SIGNALS.QUOTE_LOADED
                }
            )
            .subscribe(
                ({data}) => {
                    this.setState({
                        selected: data.id == this.props.quote.id
                    });
                    }
            )
    }

    toggle() {
        send(this.props.bus, SIGNALS.QUOTE_TOGGLE, {id: this.props.quote.id});
        fetchQuotes(this.props.bus);
    }

    render() {
        //noinspection JSUnresolvedVariable,JSUnresolvedVariable
        return (
            <div
                className={classNames("list-group-item", {active: this.state.selected})}
                onClick={
                    () => send(
                        this.props.bus,
                        SIGNALS.QUOTE_SELECTED,
                        {id: this.props.quote.id}
                    )
                }
            >
                <p>
                    <a href="#" onClick={this.toggle.bind(this)} className="toggle">
                        <i className="fa fa-eye-slash" />
                    </a>
                    <span className="badge badge-id">
                        {this.props.quote.id}
					</span>
                    <span
                        className="list-group-item-text"
                        dangerouslySetInnerHTML={formatQuote(this.props.quote)}
                    />
                </p>
            </div>
        )
    }
}

class AddQuoteItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: false};
    }

    componentDidMount() {
        this.props.bus
            .filter(
                ({tell}) => {
                    return tell == SIGNALS.QUOTE_LOADED
                }
            )
            .subscribe(
                ({data}) => {
                    this.setState({
                        selected: data.id == -1
                    });
                }
            )
    }

    render() {
        //noinspection JSUnresolvedVariable,JSUnresolvedVariable
        return (
            <div
                className={classNames("list-group-item add-quote-item", {active: this.state.selected})}
                onClick={
                    function() {
                        send(
                            this.props.bus,
                            SIGNALS.QUOTE_SELECTED,
                            {id: -1}
                        );
                    }.bind(this)
                }
            >
                <p>
                    +
                </p>
            </div>
        )
    }
}

export class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {quotes: []};
        // Load quotes on signal
        this.props.bus
            .filter(
                ({tell}) => {
                    return tell == SIGNALS.QUOTES_FETCHED
                }
            )
            .subscribe(
                ({data}) => {
                    this.setState({quotes: data})
                }
            )
    }



    render() {
        return (
            <div className="cite-list list-group">
                 {_.map(
                     this.state.quotes,
                     (quote) => <Quote
                         key={quote.id}
                         quote={quote}
                         bus={this.props.bus}
                     />
                 )}
                <AddQuoteItem bus={this.props.bus} />
            </div>
        )
    }
}

const toolbarItems = [

    {
        label: 'Text',
        type: 'group',
        items: [
            {type: 'bold', label: 'Bold'},
            {type: 'italic', label: 'Italic'},
            {type: 'strike', label: 'Strike'},
            {type: 'underline', label: 'Underline'},
            {type: 'separator'},
            {type: 'link', label: 'Link'},
            {type: 'image', label: 'Image'},
        ]
    },

    {
        label: 'Blocks',
        type: 'group',
        items: [
            {type: 'bullet', label: 'Bullet'},
            {type: 'separator'},
            {type: 'list', label: 'List'},
            {type: 'separator'},
            {
                label: 'Alignment',
                type: 'align',
                items: [
                    {label: '', value: 'left', selected: true},
                    {label: '', value: 'center'},
                    {label: '', value: 'right'},
                    {label: '', value: 'justify'}
                ]

            }
        ]
    },
];

export class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
    }
    componentDidMount() {
        this.props.bus
            .filter(
                ({tell}) => {
                    return tell == SIGNALS.QUOTE_LOADED
                }
            )
            .subscribe(
                ({data}) => {
                    this.setState({
                        value: data.text,
                        id: data.id
                    });
                }
            )
    }
    onEditorChange(value) {
        this.setState({value});
    }
    onSave() {
        console.log(this.state.id);
        send(
            this.props.bus,
            this.state.id>=0?SIGNALS.QUOTE_SAVE:SIGNALS.QUOTE_ADD,
            {
                id: this.state.id,
                text: this.state.value
            }
        );
        fetchQuotes(this.props.bus);
    }

    render() {
        return (
            <div>
                <ReactQuill
                    className="editor panel-body"
                    theme="snow"
                    toolbar={toolbarItems}
                    value={this.state.value}
                    onChange={this.onEditorChange.bind(this)}
                />
                <div className="panel-footer">
                    <button
                        className="btn btn-default"
                        onClick={this.onSave.bind(this)}
                    >Save</button>
                </div>
            </div>
        )
    }

}
