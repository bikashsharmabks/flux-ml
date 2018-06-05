import React, { Component } from 'react';

class TopMention extends Component {

  render() {
        var topMentions = this.props.source.map(function(tm){
            return (
              <div className="row" key={tm.userScreenName}>
                <div className="col-12 mt-1">
                  <div className="mr-2 float-left">
                      <div className="avatar">
                          <img src={tm.profileUrl} className="img-avatar" alt="admin@bootstrapmaster.com"/>
                      </div>
                  </div>
                  <div>
                      {<span className="font-weight-bold">{tm.userScreenName}</span>}
                      {<span className="text-muted"> @{tm.userScreenName}</span>}
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
            <div className="h4 mb-1">Top Mentions</div> 
              {topMentions}
            </div>
        </div>
      )
  }
}

export default TopMention;
