(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//DRAFT COMPONENTS
const {Editor, EditorState, RichUtils, CompositeDecorator} = Draft;

class EditorBlock extends React.Component {
    render() {
        return (
            React.createElement(Editor, {
                editorState: this.props.editorState, 
                handleKeyCommand: this.props.handleKeyCommand, 
                onChange: this.props.onChange, 
                placeholder: "Be cool.", 
                ref: "editor", 
                spellCheck: true}
            )
        );
    }
}

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            React.createElement("div", {className: "btn-toolbar"}, 
                React.createElement(InlineStyleButtons, {
                    editorState: this.props.editorState, 
                    onToggle: this.props.toggleInlineStyle}
                ), 
                React.createElement("div", {className: "btn-group"}, 
                    React.createElement("button", {className: "btn", "data-original-title": "Align Right"}, React.createElement("i", {className: "icon-align-right"})), 
                    React.createElement("button", {className: "btn", "data-original-title": "Align Center"}, React.createElement("i", {className: "icon-align-center"})), 
                    React.createElement("button", {className: "btn", "data-original-title": "Align Left"}, React.createElement("i", {className: "icon-align-left"}))
                ), 
                React.createElement("div", {className: "btn-group pull-right", role: "group", "aria-label": "Share/Export group"}, 
                    React.createElement("button", {type: "button", className: "btn btn-default", "aria-label": "Left Align"}, 
                        React.createElement("span", {className: "glyphicon glyphicon-send", "aria-hidden": "true"}), 
                            "Share"
                    ), 
                    React.createElement("div", {className: "btn-group", role: "group"}, 
                        React.createElement("button", {type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false"}, 
                            React.createElement("span", {className: "glyphicon glyphicon-export", "aria-hidden": "true"}, " "), 
                                "Export", 
                            React.createElement("span", {className: "caret"})
                        ), 
                        React.createElement("ul", {className: "dropdown-menu"}, 
                            React.createElement("li", null, React.createElement("a", {href: "#"}, "Excel")), 
                            React.createElement("li", null, React.createElement("a", {href: "#"}, "PDF")), 
                            React.createElement("li", null, React.createElement("a", {href: "#"}, "PNG"))
                        )
                    )
                )
            )
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
            React.createElement("div", null, 
                React.createElement(Toolbar, {editorState: editorState, onToggle: this.toggleInlineStyle}), 
                React.createElement("div", {className: "container"}, 
                    "TestBed", 
                    React.createElement(EditorBlock, {
                        editorState: editorState, 
                        handleKeyCommand: this.handleKeyCommand, 
                        onChange: this.onChange}
                    )
                )
            )
        );
    }
}


////////////////
// INLINE_STYLES

class InlineStyleButtons extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(type.style);
        };
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
        if (currentStyle.has(type.style)) {
            buttonclassName += 'active'
        }

        return (
            React.createElement("div", {className: "btn-group"}, 
                INLINE_STYLES.map(type =>
                    React.createElement("button", {
                        className: buttonclassName, 
                        key: type.label, 
                        "aria-label": type.label, 
                        onMouseDown: this.onToggle
                    }, 
                        React.createElement("span", {className: type.icon, "aria-hidden": "true"})
                    )
                )
            )
        );
    }
}


// ========================================

ReactDOM.render(
    React.createElement(Workspace, null),
    document.getElementById("workspace")
);

},{}]},{},[1]);
