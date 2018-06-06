import React, { Component } from 'react';

class TopInfluencers extends Component {

  render() {
        var topInfluencers = this.props.source.map(function(tm){
            return (
              <div className="row" key={tm.userScreenName}>
                <div className="col-12 mt-1">
                  <div className="mr-2 float-left">
                      <div className="avatar">
                          <img src={tm.profileUrl} className="img-avatar" alt="admin@bootstrapmaster.com"/>
                      </div>
                  </div>
                 <div style={{marginTop: 12}}>
                     {<span  className="font-weight-bold">{tm.userScreenName}</span>}
                     {<span className="text-muted"> @{tm.userScreenName}</span>}
                     {tm.verified ? <span className="text-success font-weight-bold fa fa-check-circle" style={{marginLeft:5}}/> : ""}
                 
              
                 </div>
                </div>          
              </div>)
            })
      return (
        <div className="card">
          <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <div className="text-success">@</div>
            </div>
            <div className="h4 mb-1">Top Influencers</div> 
              {topInfluencers}
            </div>
        </div>
      )
  }
}

export default TopInfluencers;
