import React from 'react';
import ReactDOM from 'react-dom';

var RecentComparisons = React.createClass({
	

    render: function() {
    	var names = this.props.feed;
                    
        return (
        	<div>
        		{names.map(function(name){ return <div className="tile"> {name} </div>}) }
    		</div>
    	)
    }
});
 
ReactDOM.render(
	<RecentComparisons {...(recent-comp.dataset)}/>, 
	document.getElementById('recent-comp')
	);
