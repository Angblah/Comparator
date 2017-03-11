//ES6 Syntax

import React from 'react';
import ReactDOM from 'react-dom';

// RECENT COMPARISONS
var RecentComparisons = React.createClass({
	

    render: function() {
    	var data = JSON.parse(this.props.feed);
    	console.log(data);
        if (data != undefined) {
            return (
            	<div>
            		{data.map(function(data){ return <div className="tile"> {data['name']} </div>}) }
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
        var data = JSON.parse(this.props.feed);
        console.log(data);
        if (data != undefined) {
            return (
                <div>
                    {data.map(function(data){ return <div className="fixed-tile"> {data['name']} </div>}) }
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