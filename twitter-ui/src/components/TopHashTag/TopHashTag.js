import React, { Component } from 'react';

class TopHashTag extends Component {

  constructor (props) {
    super(props);
  }

  render() {
     var topHashtags = this.props.source.map(function(th){
            return (
              <div className="col-12 mt-1">
                  <span className="badge badge-success hashtags">#{th.hashtag}</span>
              </div>
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
              {topHashtags}
            </div>
        </div>
      </div>
    )
  }
}

export default TopHashTag;
