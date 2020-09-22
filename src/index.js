import React from 'react';
import ReactDOM from 'react-dom';
import firebase from './firebase'
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom'

import 'semantic-ui-css/semantic.min.css'

// Components
import App from './Components/App';
import Login from './Components/Auth/Login'
import Register from './Components/Auth/Register'
import Spinner from './Spinner'

import rootReducer from './reducers'
import { setUser } from './actions/index'

import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'

const store = createStore(rootReducer, composeWithDevTools())

class Root extends React.Component {

    componentDidMount() {
      firebase.auth().onAuthStateChanged(user=> {
        if(user) {
          this.props.setUser(user)
          this.props.history.push('/')
        }
      })
    }

  render() {
    return this.props.isLoading ? <Spinner /> : (
      <Switch>
        <Route path='/' exact component={App} />
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
      </Switch>
    );
  }
}

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(
  connect(
    mapStateFromProps,
    { setUser }
  )(Root))

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>
, document.getElementById("root"));