import React from 'react';
import ReactDOM from 'react-dom';

var RecentComparisons = React.createClass({
	

    render: function() {
    	var names = JSON.parse(this.props.feed);
        // names = Array.isArray(names) ? names : [names];
        if (names != undefined) {            
            return (
            	<div>
            		{names.items.map(function(name){ return <div className="tile"> {name} </div>}) }
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
