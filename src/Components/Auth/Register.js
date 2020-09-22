import React from 'react';
import firebase from '../../firebase'

import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

class Register extends React.Component {

  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(createdUser => {
        console.log(createdUser)
      })
      .catch(err => console.error(err))
  } 

  render() {

    const {username, email, password, passwordConfirmation} = this.state

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h2" icon color="blue" textAlign="center">
            <Icon name="puzzle piece" color="blue">
              Inscription
            </Icon>
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid name="username"
                icon="user"
                iconPosition="left"
                placeholder="Pseudo"
                onChange={this.handleChange}
                type="text"
                value={username}
              />
              <Form.Input
                fluid name="email" 
                icon="mail" 
                iconPosition="left" 
                placeholder="Adresse mail" 
                onChange={this.handleChange} 
                type="email"
                value={email}
              />
              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Mot de passe"
                onChange={this.handleChange}
                type="password"
                value={password}
               />
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Confirmation du mot de passe"
                onChange={this.handleChange}
                type="password"
                value={passwordConfirmation}
               />
              <Button color="pink" fluid size="large">
                Envoyer
              </Button>
              <Message>
                Deja utilisateur ? <Link to="/login">Login</Link>
              </Message>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;