import React, { Component } from 'react';

class Sentiment extends Component {

  constructor (props) {
    super(props);
  }

  render() {
    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <i className="fa fa-smile-o text-success"></i>
            </div>
            <div className="h4 mb-0">Sentiment Analysis</div>
        </div>
      </div>
    )
  }
}

export default Sentiment;
