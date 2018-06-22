import React, { Component } from 'react';

class Header extends Component {

  sidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-hidden');
  }

  mobileSidebarToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('sidebar-mobile-show');
  }

  asideToggle(e) {
    e.preventDefault();
    document.body.classList.toggle('aside-menu-hidden');
  }

  render() {
    return (
      <header className="app-header navbar">
        <a className="navbar-brand" href="#"></a>
        <div className="nav navbar nav-item hidden-md-down">
          <div className="h4 mt-auto">Social Media Analytics</div>
        </div>
        <div className="nav navbar-nav hidden-md-down">
        
        </div>
      </header>
    )
  }
}

export default Header;
