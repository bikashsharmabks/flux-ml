import React, { Component } from 'react';

import StatCard from '../../components/StatCard/StatCard.js';
import TopMention from '../../components/TopMention/TopMention.js'
import TopHashTag from '../../components/TopHashTag/TopHashTag.js'
import Sentiment from '../../components/Sentiment/Sentiment.js'
import TrendChart from '../../components/TrendChart/TrendChart.js'


class HashTag extends Component {

  constructor(props) {
    super(props);
    this.state = { activityCount: 0,
    	verified: 0, 
    	userInteracted: 0,
    	topMentions: [],
    	topHashTags: [],
    	sentiments: [],
    	activities: [] };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
    	this.getCount()
    	this.getActivities()
    	this.top()
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getCount() {
    this.setState(prevState => ({
      activityCount: prevState.activityCount + 1,
      verified: prevState.verified + 1,
      userInteracted: prevState.userInteracted + 1
    }));
  }


  getActivities() {
    this.setState(prevState => ({
      activities: []
    }));
  }

  top() {
  	this.setState(prevState => ({
      topMentions: [],
      topHashTags: [],
      sentiments: []
    }));
  }


  render() {

  	const activityCount = this.state.activityCount
  	const verified = this.state.verified
  	const userInteracted = this.state.userInteracted
  	const topMentions = []
  	const topHashTags = []
  	const sentiments = []
  	const activities = []
  	
    return (
      <div className="animated fadeIn">

      	<div className="row mt-2">
	  		<div className="col-sm-6 col-lg-3">
	  			<div className="h2 font-weight-bold">#{this.props.routeParams.hashTag}</div>
	  		</div>
      	</div>

        <div className="row mt-1">

        	<div className="col-lg-8">
        		<div className="row">
					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Twitter Activities" 
							icon="icon-social-twitter" 
							value={activityCount}>
						</StatCard>
					</div>

					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Verified Profile" 
							icon="fa fa-check-circle" 
							value={verified}>
						</StatCard>
					</div>

					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Users Interacted" 
							icon="icon-people" 
							value={userInteracted}>
						</StatCard>
					</div>
				</div>

				<div className="row">
					<div className="col-lg-12">
						<TrendChart source={activities}></TrendChart>
					</div>
				</div>
			</div>

			<div className="col-lg-4">
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopMention source={topMentions}></TopMention>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopHashTag source={topHashTags}></TopHashTag>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<Sentiment source={sentiments}></Sentiment>
					</div>
				</div>
			</div>

        </div>

      </div>
    )
  }
}

export default HashTag;
