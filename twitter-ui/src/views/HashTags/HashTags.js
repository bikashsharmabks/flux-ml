import React, { Component } from 'react';
import { Link } from 'react-router'

class HashTags extends Component {

  render() {
  	return (
	  	<div className="animated fadeIn">

	      	<div className="row mt-2">
		  		<div className="col-sm-6 col-lg-3">
		  			<div className="h2">Trends for you</div>
		  		</div>
	      	</div>

	        <div className="row mt-1">
	        	<div className="col-lg-12">

	        		<div className="card-deck">
					  
					  <Link to={'/hashTags/CeBIT2018'} className="card hashtags">
					    <div className="card-body p-1">
					      <h4 className="card-title brand-success">#CeBIT2018</h4>
					      <p className="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
					    </div>
					  </Link>

					  <Link to={'/hashTags/MondayMotivation'} className="card hashtags">
					    <div className="card-body p-1">
					      <h4 className="card-title">#MondayMotivation</h4>
					      <p className="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
					    </div>
					  </Link>
					 
					</div>

				</div>
	        </div>

      	</div>
    )
  }

}

export default HashTags;