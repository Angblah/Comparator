//ES6 Syntax

import React from 'react';
import ReactDOM from 'react-dom';

// RECENT COMPARISONS
var RecentComparisons = React.createClass({
	

    render: function() {
    	var names = JSON.parse(this.props.feed);
        names = names.slice(0,5);
        console.log(names);
        if (names != undefined) {            
            return (
            	<div>
            		{names.map(function(name){ return <div className="tile"> {name} </div>}) }
        		</div>
        	)
        } else {
            return (
                <div>
                    <div className="tile"> No Comparisons Yet </div>
                </div>
            )   
        }
    }
});

var namedoc = document.getElementById('recent-comp');
ReactDOM.render(
	<RecentComparisons {...(namedoc.dataset)}/>, 
	   namedoc
	);

// ALL COMPARISONS
var Comparisons = React.createClass({
    

    render: function() {
        var names = JSON.parse(this.props.feed);
        console.log(names);
        if (names != undefined) {            
            return (
                <div>
                    {names.map(function(name){ return <div className="fixed-tile"> {name} </div>}) }
                </div>
            )
        } else {
            return (
                <div>
                    <div className="fixed-tile"> No Comparisons Yet </div>
                </div>
            )   
        }
    }
});

var compName = document.getElementById('all-comp');
ReactDOM.render(
    <Comparisons {...(compName.dataset)}/>, 
       compName
    );