import React, { Component } from 'react';
import { Link } from 'react-router';
import superagent from 'superagent';

class HashTags extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hashtags: [],
		};
	}

	componentDidMount() {
		this.getHashtags();
	}

	getHashtags() {
		superagent.get('/api/hashtags')
			.set('Accept', 'application/json')
			.end((error, response) => {
				if (error) {
					console.log(error)
				} else {
					this.setState({
						hashtags: response.body
					});
				}
			});
	}

  render() {

  	var allHashtags = this.state.hashtags.map(function(ah){
  		console.log("ah", ah.hashtag);
            return (
                 <Link to={'/hashTags/' + ah.hashtag} key={ah.hashtag} className="card hashtags">
					<div className="card-body p-1">
					    <h4 key={ah.hashtag} className="card-title brand-success">#{ah.hashtag}</h4>
					      <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
					</div>
				</Link>
            )
          })

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
	        			{allHashtags}					 
					</div>

				</div>
	        </div>

      	</div>
    )
  }
}

export default HashTags;