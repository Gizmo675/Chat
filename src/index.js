import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Components
import App from './Components/App';
import Login from './Components/Auth/Login'
import Register from './Components/Auth/Register'

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path='/' exact component={App} />
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
