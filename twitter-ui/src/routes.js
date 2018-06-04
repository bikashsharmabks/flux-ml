import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

// Containers
import Full from './containers/Full/'
// import Simple from './containers/Simple/'

import HashTags from './views/HashTags/HashTags.js'
import HashTag from './views/HashTag/HashTag.js'

export default (
  <Router history={hashHistory}>
    <Route path="/" name="Home" component={Full}>
      <IndexRoute component={HashTags}/>
      <Route path="/hashTags/:hashTag" name="HashTag" component={HashTag}/>
      <Route path="/" name="HashTags" component={HashTags}/>
    </Route>
  </Router>
);
