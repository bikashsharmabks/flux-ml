import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Progress } from 'reactstrap';
import moment from 'moment';
import _ from 'lodash';

//const brandPrimary =  '#20a8d8';
const brandSuccess =  '#4dbd74';
const brandInfo =     '#63c2de';
const brandDanger =   '#f86c6b';

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

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50,200));
  data2.push(random(80,100));
  data3.push(65, 100);
}
//'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'
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
      borderWidth: 1,
      borderDash: [8, 5],
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
      gridLines: {
        drawOnChartArea: false,
      }
    }],
    yAxes: [{
      ticks: {
        beginAtZero: true,
        maxTicksLimit: 5,
        stepSize: Math.ceil(250 / 5),
        max: 250
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

function getMinTime(data) {
  return data.reduce((min, d) => d.time < min ? d.time : min, data[0].time);
}

function getMaxTime(data) {
  return data.reduce((max, d) => d.time > max ? d.time : max, data[0].time);
}

function getFormattedLabelData(label){
  var formattedLabel = [];
    for(var i=0; i< label.length; i++){
      formattedLabel.push(label[i].format("HH:mm"))
    }
    return formattedLabel;
  }

class TrendChart extends Component {

  constructor (props) {
    super(props);
    this.state = {
      mainChart : mainChart
    }
  }
  // componentWillReceiveProps() {
    
  // }
  

  render() {
    //console.log("trend-activity", this.props.source)
    let newState = Object.assign({}, this.state);
    var source = this.props.source;
    if (Object.keys(source).length !== 0) {
      var tweets = source["tweet"],
      retweets = source["retweet"],
      quotes = source["quote"];
      var all = [...tweets, ...retweets, ...quotes]
      var minTime = getMinTime(all);
      var maxTime = getMaxTime(all);
      minTime = moment(minTime).utc();
      maxTime= moment(maxTime).utc();
      var label=[];
      while(minTime.isSameOrBefore(maxTime, 'minutes')){
        label.push(moment(new Date(_.cloneDeep(minTime))).utc());
        minTime.add(1, "m");
      }
      var labelCount = label.length;
      var tweetData = []
      for (var i = 0; i < labelCount; i++) {
        for (var j = i; j < tweets.length; j++) {
          console.log(moment(tweets[j].time).utc().toString(), "@@@@", label[i].toString())
          if (moment(tweets[j].time).utc().isSame(label[i], 'minute')) {
            console.log(tweets[j])
            if(tweets[j].count == null){
              tweets[j].count = 0;
            }
            tweetData.push(tweets[j].count + tweetData[tweetData.length - 1]);
          } else {
            if (tweetData.length == 0){
              tweetData.push(0);
            }
            else{
              tweetData.push(tweetData[tweetData.length - 1])
            }
            i++;
          }
        }
      }
      console.log(tweetData)
    }

    return (
      <div className="card">
        <div className="card-block">
          <div className="row">
            <div className="col">
              <div className="h2 text-muted text-right mb-0 float-right">
              <i className="icon-graph text-success"></i>
          </div>
              <h4 className="card-title mb-0">Trends</h4>
              <div className="small text-muted">Since 9:00 AM Today</div>
            </div>
           
          </div>
          <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
            <Line data={mainChart} options={mainChartOpts} height={300}/>
          </div>
        </div>
        <div className="card-footer">
          <ul>
            <li>
              <div className="text-muted">Tweets</div>
              <strong>2903 (40%)</strong>
              <Progress className="progress-xs mt-h" color="success" value="40" />
            </li>
            <li className="hidden-sm-down">
              <div className="text-muted">Retweets</div>
              <strong>240 (20%)</strong>
              <Progress className="progress-xs mt-h" color="info" value="20" />
            </li>
            <li className="hidden-sm-down">
              <div className="text-muted">Quotes</div>
              <strong>221 (30%)</strong>
              <Progress className="progress-xs mt-h" color="danger" value="80" />
            </li>
           
          </ul>
        </div>
      </div>
    )
  }
}

export default TrendChart;
