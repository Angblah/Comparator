(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RecentComparisons = React.createClass({displayName: "RecentComparisons",
	
    render: function() {
    	var names = ['Jake', 'Jon', 'Thruster'];
        // var namesList = names.map(function(name, index){
        //     			return <div class="tile">{name}</div>
        //   			})
                    
        return (
        	React.createElement("div", null, 
        		names.map(function(name){ return React.createElement("div", {className: "tile"}, " ", name, " ")}) 
    		)
    	)
    }
});
 
ReactDOM.render(
	React.createElement(RecentComparisons, null), 
	document.getElementById('recentComp')
	);
},{}]},{},[1]);
