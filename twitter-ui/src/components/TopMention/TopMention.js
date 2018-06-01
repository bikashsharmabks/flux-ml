import React, { Component } from 'react';

class TopMention extends Component {

  constructor (props) {
    super(props);
  }

  render() {
    

    return (
      <div className="card">
        <div className="card-block">
            <div className="h3 text-muted text-right mb-0 float-right">
                <div className="text-success">@</div>
            </div>
            <div className="h4 mb-1">Top Mentions</div>
           
            <div className="row">
              
              <div className="col-12 mt-1">
                  <div className="mr-2 float-left">
                      <div className="avatar">
                          <img src="https://pbs.twimg.com/profile_images/873177304259854337/WBjmwo78_400x400.jpg" className="img-avatar" alt="admin@bootstrapmaster.com"/>
                      </div>
                  </div>
                  <div>
                      <span className="font-weight-bold">Cebit</span>&nbsp;<span className="text-muted">@cebit</span>
                  </div>
              </div>
                    
                    
            </div>

            <div className="row">
                <div className="col-12 mt-1">
                    <div className="mr-2 float-left">
                        <div className="avatar">
                            <img src="https://pbs.twimg.com/profile_images/378800000375306622/fc201b9b78535333dd47222ccced021e_400x400.png" className="img-avatar" alt="admin@bootstrapmaster.com"/>
                        </div>
                    </div>
                    <div>
                        <span className="font-weight-bold">People10</span>&nbsp;<span className="text-muted">@people_10</span>
                    </div>
                </div>
            </div>   
        </div>
      </div>
    )
  }
}

export default TopMention;
