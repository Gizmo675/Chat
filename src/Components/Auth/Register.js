import React from 'react';

import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

class Register extends React.Component {

  handleChange = () => {}

  render() {
    return (
      <Grid textAlign="center" verticalAlign="middle">
        <Grid.Column>
          <Header as="h2" icon color="blue" textAlign="center">
            <Icon name="puzzle piece" color="blue">
              Inscription
            </Icon>
          </Header>
          <Form size="large" >
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="Pseudo" onChange={this.handleChange} type="text" />
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Adresse mail" onChange={this.handleChange} type="email" />
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Mot de passe" onChange={this.handleChange} type="password" />
              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Confirmation du mot de passe" onChange={this.handleChange} type="password" />
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