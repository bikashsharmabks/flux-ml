import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
//import { Progress } from 'reactstrap';

const brandInfo = '#63c2de';
const brandSuccess = '#4dbd74';
const brandDanger = '#f86c6b';

// Main Chart

// convert Hex to RGBA
function convertHex(hex,opacity) {
  hex = hex.replace('#','');
  var r = parseInt(hex.substring(0,2), 16);
  var g = parseInt(hex.substring(2,4), 16);
  var b = parseInt(hex.substring(4,6), 16);

  var result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
  return result;
}

//Random Numbers
function random(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

var elements = 30;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50,200));
  data2.push(random(80,100));
  data3.push(65, 100);
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
      data: data1
    },
    {
      label: 'Retweets',
      backgroundColor: 'transparent',
      borderColor: brandSuccess,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data2
    },
    {
      label: 'Quotes',
      backgroundColor: 'transparent',
      borderColor: brandDanger,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      //borderDash: [8, 5],
      data: data3
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
      tweetCount: 0,
      retweetCount:0,
      quoteCount: 0,
      time: "HH:MM"
    }
  }

  componentWillReceiveProps() {
    let newState = Object.assign({}, this.state);
    var source = this.props.source;
    if (Object.keys(source).length !== 0) {
      if (source.tweetData && source.retweetData && source.quoteData) {
        newState.mainChart.labels = source.labels;
        newState.time = source.labels[0];
        newState.mainChart.datasets[0].data = source.tweetData;
        newState.mainChart.datasets[1].data = source.retweetData;
        newState.mainChart.datasets[2].data = source.quoteData;
        this.setState(newState);
      }
    }
  }

  componentWillUnmount() {
    this.state.mainChart = {}
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
              <div className="small text-muted">Since {this.state.time} today</div>
            </div>
           
          </div>
          <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
            <Line data={this.state.mainChart} options={mainChartOpts} height={300}/>
          </div>
        </div>
        <div className="card-footer">
          <ul>

            <li>
              <div className="text-muted"><font color="brandSuccess"><b>Tweets</b></font></div>
              <strong>{this.state.tweetCount} (40%)</strong>  
            </li>

            <li className="hidden-sm-down">
              <div className="text-muted"><font color="brandDanger"><b>Retweets</b></font></div>
              <strong>240 (20%)</strong> 
            </li>

            <li className="hidden-sm-down">
              <div className="text-muted"><font color="brandInfo"><b>Quotes</b></font></div>
              <strong>221 (30%)</strong> 
            </li>

          </ul>
        </div>
      </div>
    )
  }
}

export default TrendChart;
