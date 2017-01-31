//DRAFT COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState, RichUtils, CompositeDecorator} from 'draft-js';

class EditorBlock extends React.Component {
    render() {
        return (
            <Editor 
                editorState={this.props.editorState}
                handleKeyCommand={this.props.handleKeyCommand}
                onChange={this.props.onChange}
                placeholder="Be cool."
                ref="editor"
                spellCheck={true}
            />
        );
    }
}

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="btn-toolbar">
                <InlineStyleButtons
                    editorState={this.props.editorState}
                    onToggle={this.props.toggleInlineStyle}
                />
                <div className="btn-group">
                    <button className="btn" data-original-title="Align Right"><i className="icon-align-right"></i></button>
                    <button className="btn" data-original-title="Align Center"><i className="icon-align-center"></i></button>
                    <button className="btn" data-original-title="Align Left"><i className="icon-align-left"></i></button>
                </div>
                <div className="btn-group pull-right" role="group" aria-label="Share/Export group">
                    <button type="button" className="btn btn-default" aria-label="Left Align">
                        <span className="glyphicon glyphicon-send" aria-hidden="true"></span>
                            Share
                    </button>
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="glyphicon glyphicon-export" aria-hidden="true"> </span>
                                Export
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu">
                            <li><a href="#">Excel</a></li>
                            <li><a href="#">PDF</a></li>
                            <li><a href="#">PNG</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty()};
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    render() {
        const {editorState} = this.state;

        return (
            <div>
                <Toolbar editorState={editorState} onToggle={this.toggleInlineStyle}/>
                <div className="container">
                    TestBed
                    <EditorBlock
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }
}


////////////////
// INLINE_STYLES

class InlineStyleButtons extends React.Component {
    constructor() {
        super();
        /*this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(type.style);
        };*/
    }

    render() {
        var currentStyle = this.props.editorState.getCurrentInlineStyle();
        var INLINE_STYLES = [
            {label: 'Bold', style: 'BOLD', icon: 'glyphicon glyphicon-bold'},
            {label: 'Italic', style: 'ITALIC', icon: 'glyphicon glyphicon-italic'},
            {label: 'Link', style: 'LINK', icon: 'glyphicon glyphicon-link'},
            {label: 'Underline', style: 'UNDERLINE', icon: ''},
        ];

        var buttonclassName = 'btn btn-default';
        //Check current style
        /*if (currentStyle.has(type.style)) {
            buttonclassName += 'active'
        }*/

        return (
            <div className="btn-group">
                {INLINE_STYLES.map(type =>
                    <button
                        className={buttonclassName}
                        key={type.label}
                        aria-label={type.label}
                        onMouseDown={this.onToggle}
                    >
                        <span className={type.icon} aria-hidden="true"></span>
                    </button>
                )}
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Workspace />,
    document.getElementById("workspace")
);