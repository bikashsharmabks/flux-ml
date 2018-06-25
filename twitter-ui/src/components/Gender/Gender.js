import React, { Component } from 'react';

class Gender extends Component {
  
  render() {

    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <i className="font-weight-bold fa fa-male" style={{color:"#1da1f2"}}></i>
                <i className="font-weight-bold  fa fa-female" style={{color:"pink"}}></i>
            </div>
            <div className="h4 mb-0">Gender Analysis</div>  
                <div className ="progress" style={{marginTop : 30}}>
                    <div className="progress-bar" role="progressbar" style={{width: this.props.source.malePercentage+"%",backgroundColor:"#1da1f2" }} ariaValueNow={this.props.source.malePercentage} ariaValueMin="0" ariaValueMax="100"></div>
                    <div className="progress-bar" role="progressbar" style={{width:this.props.source.femalePercentage+"%",backgroundColor:"pink"}} ariaValueNow={this.props.source.femalePercentage} ariaValueMin="0" ariaValueMax="100"></div>
                </div>

                <div className="d-flex flex-row justify-content-center" style={{marginTop:10}}>
                    <div className= "font-weight-bold" style={{marginLeft:20,color:"#1da1f2"}}>{this.props.source.malePercentage}%</div>
                    <div className= "font-weight-bold" style={{marginLeft:20,color:"pink"}}>{this.props.source.femalePercentage}%</div>
                </div>

            </div>

      </div>
    )
  }
}

export default Gender;
