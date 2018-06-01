import React, { Component } from 'react';

class StatCard extends Component {

  constructor (props) {
    super(props);
  }

  render() {
    

    return (
      <div className="card">
          <div className="card-block">
              <div className="h2 text-muted text-right mb-0 float-right">
                  <i className={`text-success ${ this.props.icon }`}></i>
              </div>
              <div className="h4 mb-0">{this.props.value}</div>
              <small className="text-muted text-uppercase font-weight-bold">{this.props.text}</small>        
          </div>
      </div>
    )
  }
}

export default StatCard;
