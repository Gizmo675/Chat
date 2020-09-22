import React from 'react';
import firebase from '../../firebase'

import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

class Login extends React.Component {

  state = {
    email: '',
    errors: [], 
    loading: false,
  }

  // On affiche les erreurs dans un paragraphe en bouclant sur le tableau d'erreur
  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = event => {
    // On empeche la page de recharger
    event.preventDefault()
    if (this.isFormValid()){
      // si le formulaire est valide on efface les erreurs et on passe en chargement
      this.setState({ errors: [], loading: true })
  }}

  handleInputError = (errors, inputName) => {
    // On change visuellement le champ qui contient un erreur en ajoutant la classe erreur
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
  }

  render() {

    const {email, password, errors, loading} = this.state

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet">
              Connexion
            </Icon>
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>

              <Form.Input
                fluid name="email" 
                icon="mail" 
                iconPosition="left" 
                placeholder="Adresse mail" 
                onChange={this.handleChange} 
                type="email"
                value={email}
                className={this.handleInputError(errors, 'email')}
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
                className={this.handleInputError(errors, 'password')}
               />

              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                color="pink"
                fluid
                size="large"
              >
                Envoyer
              </Button>
            </Segment>
          </Form>
          {errors.length>0 && (
            <Message error>
              <h3>Erreur</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Pas encore inscrit ? <Link to="/register">Inscription</Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login;