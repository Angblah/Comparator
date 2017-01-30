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
	<RecentComparisons {...(recentComp.dataset)}/>, 
	document.getElementById('recentComp')
	);
