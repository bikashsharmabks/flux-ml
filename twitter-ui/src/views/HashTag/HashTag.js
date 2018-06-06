import React, { Component } from 'react';
import superagent from 'superagent';

import StatCard from '../../components/StatCard/StatCard.js';
import TopInfluencer from '../../components/TopInfluencer/TopInfluencer.js'
import TopHashTag from '../../components/TopHashTag/TopHashTag.js'
import Sentiment from '../../components/Sentiment/Sentiment.js'
import TrendChart from '../../components/TrendChart/TrendChart.js'


class HashTag extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activityCount: 0,
      verified: 0,
      userInteracted: 0,
      topInfluencers: [],
      topHashTags: [],
      sentiments: [],
      activities: [],
      //hashtag: "bypolls"
      hashtag: props.routeParams.hashTag
    };
  }

  // componentDidMount() {
  //    // this.getCount();
  //    // this.top();
  //   this.interval1 = setInterval(this.getCount(), 5000);
  //   this.interval2 = setInterval(this.top(), 5000);
  // }

  componentDidMount() {
    this.interval1 = setInterval(() => {
      this.getCount()
      this.top()
    }, 5000);
    this.interval2 = setInterval(() => {
      this.getActivities()
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval1);
    clearInterval(this.interval2);
  }

  async getCount() {
    superagent.get('/api/hashtags/' + this.state.hashtag + '/stats')
      .set('Accept', 'application/json')
      .end((error, response) => {
        if (error) {
          console.log(error)
        } else {
          let res = response.body;
          this.setState({
            activityCount: res.totalActivityCount,
            verified: res.verifiedProfileCount,
            userInteracted: res.userInteractedCount
          });
        }
      });
  }

  async getActivities() {
    superagent.get('/api/hashtags/' + this.state.hashtag + '/activity-timeseries-data')
      .set('Accept', 'application/json')
      .end((error, response) => {
        if (error) {
          console.log("error", error)
        } else {
          this.setState({
            activities: response.body
          });
        }
      });
  }

  async top() {
    try {
      var responseMention = await superagent.get('/api/hashtags/' + this.state.hashtag + '/top-user-mentions');
      var responseHashtag = await superagent.get('/api/hashtags/' + this.state.hashtag + '/top-related-hashtags');
      var responseEmotion = await superagent.get('/api/hashtags/' + this.state.hashtag + '/emotion-count');
      this.setState({
        topInfluencers: responseMention.body,
        topHashTags: responseHashtag.body,
        sentiments: responseEmotion.body
      });
    } catch (err) {
      console.log(err)
    }
  }

  render() {

  	const activityCount = this.state.activityCount
  	const verified = this.state.verified
  	const userInteracted = this.state.userInteracted
  	const topInfluencers = this.state.topInfluencers
  	const topHashTags = this.state.topHashTags
  	const sentiments = this.state.sentiments
  	const activities = this.state.activities
  	
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
            <Sentiment source={sentiments}></Sentiment>
          </div>
        </div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopInfluencer source={topInfluencers}></TopInfluencer>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopHashTag source={topHashTags}></TopHashTag>
					</div>
				</div>

				
			</div>

        </div>

      </div>
    )
  }
}

export default HashTag;
