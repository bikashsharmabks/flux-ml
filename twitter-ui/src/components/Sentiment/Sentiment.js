import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';

const doughnut = {
  labels: [
    'Negative',
    'Postive',
    'Netural'
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
                  <Doughnut data={doughnut} />
              </div>
            </div>
            
        </div>
      </div>
    )
  }
}

export default Sentiment;
