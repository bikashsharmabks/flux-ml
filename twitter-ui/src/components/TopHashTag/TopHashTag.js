import React, { Component } from 'react';

class TopHashTag extends Component {

  constructor (props) {
    super(props);
  }

  render() {
    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <i className="font-weight-bold text-success">#</i>
            </div>
            <div className="h4 mb-0">Top Hashtags</div>
            <div className="row">
              <div className="col-12 mt-1">
                  <span className="badge badge-success hashtags">#CebitGermany</span>
                  <span className="badge badge-success hashtags">#Event</span>
                  <span className="badge badge-success hashtags">#MLAI</span>
              </div>
            </div>
        </div>
      </div>
    )
  }
}

export default TopHashTag;
