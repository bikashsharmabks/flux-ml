import React, { Component } from 'react';
import Header from '../../components/Header/';
//import Sidebar from '../../components/Sidebar/';
//import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';

//import Breadcrumbs from 'react-breadcrumbs';

class Full extends Component {
  render() {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <main className="main">
            <div className="container-fluid">
              {this.props.children}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Full;
