import React from 'react';
import ReactDOM from 'react-dom';

var RecentComparisons = React.createClass({
	

    render: function() {
    	var names = this.props.feed;
        // names = Array.isArray(names) ? names : [names];
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
 
ReactDOM.render(
	<RecentComparisons {...(RecentComparisons.dataset)}/>, 
	document.getElementById('recent-comp')
	);
