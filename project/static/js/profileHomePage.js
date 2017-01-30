var RecentComparisons = React.createClass({
	
    render: function() {
    	var names = ['Jake', 'Jon', 'Thruster'];
        // var namesList = names.map(function(name, index){
        //     			return <div class="tile">{name}</div>
        //   			})
                    
        return (
        	<div>
        		{names.map(function(name){ return <div className="tile"> {name} </div>}) }
    		</div>
    	)
    }
});
 
ReactDOM.render(
	<RecentComparisons />, 
	document.getElementById('recentComp')
	);
