import React, { Component } from 'react';
import { Line , Bar  } from 'react-chartjs-2';
import moment from 'moment';
//import { Progress } from 'reactstrap';

const brandInfo = '#63c2de';
const brandSuccess = '#4dbd74';
const brandDanger = '#f86c6b';


// convert Hex to RGBA
function convertHex(hex,opacity) {
  hex = hex.replace('#','');
  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);

  var result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
  return result;
}

const sentimentChart = {
  labels: [],
  datasets: [{
    label: 'Positive Sentiment',
    backgroundColor: convertHex('#4dbd74',60),
    borderColor: '#4dbd74',
    borderWidth: 1,
    data: []
  }, {
    label: 'Negative Sentiment',
    backgroundColor: convertHex('#FF6384',60),
    borderColor: '#FF6384',
    borderWidth: 1,
    data: []
  }, {
    label: 'Neutral Sentiment',
    backgroundColor: convertHex('#FFCE56', 60),
    borderColor: '#FFCE56',
    borderWidth: 1,
    data: []
  }]
}

// const sentimentChartOpts = {
//   maintainAspectRatio: false,
//   legend: {
//     display: false
//   },
//   scales: {
//     xAxes: [{
//       stacked: true
//     }, {
//       display: false
//     }],
//     yAxes: [{
//       stacked: true
//     }]
//   },
//   elements: {
//     point: {
//       radius: 0,
//       hitRadius: 10,
//       hoverRadius: 4,
//       hoverBorderWidth: 3,
//     }
//   }
// }

const sentimentChartOpts = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      ticks: {
        display: false
      },
      stacked: true,
      gridLines: {
        drawOnChartArea: false,
      }
    }],
    yAxes: [{
      ticks: {
        display: true
      },
      stacked: true,
    }]
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    }
  }
}

const mainChart = {
  labels: [],
  datasets: [
    {
      label: 'Tweets',
      backgroundColor: convertHex(brandInfo,10),
      borderColor: brandInfo,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: []
    },
    {
      label: 'Retweets',
      backgroundColor: convertHex(brandSuccess,10),
      borderColor: brandSuccess,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: []
    },
    {
      label: 'Quotes',
      backgroundColor: convertHex(brandDanger,10),
      borderColor: brandDanger,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      //borderDash: [8, 5],
      data: []
    }
  ]
}

const mainChartOpts = {
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      ticks: {
        display: false
      },
      gridLines: {
        drawOnChartArea: false,
      }
    }],
    yAxes: [{
      ticks: {
        display: true
      }
    }]
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    }
  }
}

class TrendChart extends Component {
  constructor (props) {
    super(props);
    this.state = {
      mainChart : mainChart,
      sentimentChart: sentimentChart,
      tweetCount: 0,
      retweetCount:0,
      quoteCount: 0,
      time: "HH:MM:SS"
    }
  }

  componentWillReceiveProps() {
    let newState = Object.assign({}, this.state);
    var source = this.props.source;
    if (Object.keys(source).length !== 0) {
      if (source.tweetData && source.retweetData && source.quoteData) {
        var tCount = 0, rCount = 0, qCount = 0;
        for(var i = 0; i < source.tweetData.length; i++){
          tCount += source.tweetData[i];
        }
        for(var j = 0; j < source.retweetData.length; j++){
          rCount += source.retweetData[j];
        }
        for(var  k= 0; k < source.quoteData.length; k++){
          qCount += source.quoteData[k];
        }
        var formattedDateLabels= [];
        for(var x=0; x<source.labels.length; x++){
          formattedDateLabels.push(new Date(moment(source.labels[x])).toString());
        }
        newState.mainChart.labels = formattedDateLabels;
        newState.sentimentChart.labels = formattedDateLabels;
        newState.sentimentChart.datasets[0].data = source.positiveSentiment;
        newState.sentimentChart.datasets[1].data = source.negativeSentiment;
        newState.sentimentChart.datasets[2].data = source.neutralSentiment;
        newState.time = new Date(moment(source.labels[0])).toString();
        newState.mainChart.datasets[0].data = source.tweetData;
        newState.mainChart.datasets[1].data = source.retweetData;
        newState.mainChart.datasets[2].data = source.quoteData;
        newState.tweetCount = tCount;
        newState.retweetCount = rCount;
        newState.quoteCount = qCount;
        this.setState(newState);
        this.forceUpdate();
      }
    }
  }

  componentWillUnmount() {
    this.setState.mainChart = {}
    this.setState.sentimentChart = {}
  }

  render() {
    return (
      <div className="card">
        <div className="card-block">
          <div className="row">
            <div className="col">
              <div className="h2 text-muted text-right mb-0 float-right">
              <i className="icon-graph text-success"></i>
          </div>
              <h4 className="card-title mb-0">Trends</h4>
              <div className="small text-muted">Since {this.state.time}</div>
            </div>
           
          </div>
          <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
            <Line data={this.state.mainChart} options={mainChartOpts} height={300}/>
          </div>

          <div className="chart-wrapper" style={{height: 100 + 'px', marginTop: 20 + 'px'}}>
            <Bar data={this.state.sentimentChart} options={sentimentChartOpts} height={300}/>
          </div>
        </div>
        <div className="card-footer">
          <ul>

            <li>
              <div className="text-muted"><font color="brandSuccess"><b>Tweets</b></font></div>
              <strong>{this.state.tweetCount}</strong>  
            </li>

            <li className="hidden-sm-down">
              <div className="text-muted"><font color="brandDanger"><b>Retweets</b></font></div>
              <strong>{this.state.retweetCount}</strong> 
            </li>

            <li className="hidden-sm-down">
              <div className="text-muted"><font color="brandInfo"><b>Quotes</b></font></div>
              <strong>{this.state.quoteCount}</strong> 
            </li>

          </ul>
        </div>
      </div>
    )
  }
}

export default TrendChart;
