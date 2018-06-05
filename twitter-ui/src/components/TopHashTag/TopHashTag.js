import React, { Component } from 'react';

class TopHashTag extends Component {
  
  render() {
     var topHashtags = this.props.source.map(function(th){
            return (
                  <span key={th.hashtag} className="badge badge-success hashtags">#{th.hashtag}</span>  
            )
          })
    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <i className="font-weight-bold text-success">#</i>
            </div>
            <div className="h4 mb-0">Top Hashtags</div>  
            <div className="row">
                <div className="col-12 mt-1">
                  {topHashtags}
               </div>
              </div>
            </div>
      </div>
    )
  }
}

export default TopHashTag;
