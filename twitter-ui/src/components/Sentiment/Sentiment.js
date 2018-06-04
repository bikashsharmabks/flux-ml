import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';

const doughnut = {
  labels: [
    'Negative',
    'Postive',
    'Neutral'
  ],
  datasets: [{
    data: [300, 50, 100],
    backgroundColor: [
    '#FF6384',
    '#4dbd74',
    '#FFCE56'
    ],
    hoverBackgroundColor: [
    '#FF6384',
    '#4dbd74',
    '#FFCE56'
    ]
  }]
};

class Sentiment extends Component {

  constructor (props) {
    super(props);
    this.state = {
      doughnut : doughnut
    }
  }

  componentWillReceiveProps() {
    let newState = Object.assign({}, this.state);
    var source = this.props.source;
    var negativeCount = 0,
        positiveCount = 0,
        neutralCount =0;

    for(var i = 0 ; i < source.length;i++){
      if(source[i].sentiment == 'neutral'){
        neutralCount = source[i].count
      }
      else if(source[i].sentiment == 'positive'){
        positiveCount = source[i].count
      }
      else if(source[i].sentiment == 'negative'){
        negativeCount = source[i].count
      }
    }
    newState.doughnut.datasets[0].data = [neutralCount,positiveCount,negativeCount];
    this.setState(newState);
  }

  render() {
    
    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <i className="fa fa-smile-o text-success"></i>
            </div>
            <div className="h4 mb-0">Sentiment Analysis</div>
            <div className="row">
              <div className="col-12 mt-1">
                  <Doughnut data={this.state.doughnut} />
              </div>
            </div>
            
        </div>
      </div>
    )
  }
}

export default Sentiment;
