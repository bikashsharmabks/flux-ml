import React, { Component } from 'react';

import StatCard from '../../components/StatCard/StatCard.js';
import TopMention from '../../components/TopMention/TopMention.js'
import TopHashTag from '../../components/TopHashTag/TopHashTag.js'
import Sentiment from '../../components/Sentiment/Sentiment.js'
import TrendChart from '../../components/TrendChart/TrendChart.js'


class Dashboard extends Component {

  render() {
    return (
      <div className="animated fadeIn">

      	<div className="row mt-2">
	  		<div className="col-sm-6 col-lg-3">
	  			<div className="h2 font-weight-bold">#CeBIT18</div>
	  		</div>
      	</div>

        <div className="row mt-1">

        	<div className="col-lg-8">
        		<div className="row">
					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Twitter Activities" 
							icon="icon-social-twitter" 
							value="8756">
						</StatCard>
					</div>

					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Verified Profile" 
							icon="fa fa-check-circle" 
							value="32">
						</StatCard>
					</div>

					<div className="col-sm-8 col-lg-4">
						<StatCard 
							text="Users Interacted" 
							icon="icon-people" 
							value="6789">
						</StatCard>
					</div>
				</div>

				<div className="row">
					<div className="col-lg-12">
						<TrendChart></TrendChart>
					</div>
				</div>
			</div>

			<div className="col-lg-4">
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopMention></TopMention>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<TopHashTag></TopHashTag>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-6 col-lg-12">
						<Sentiment></Sentiment>
					</div>
				</div>
			</div>

        </div>

      </div>
    )
  }
}

export default Dashboard;
