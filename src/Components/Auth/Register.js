import React from 'react';
import firebase from '../../firebase'
import md5 from 'md5'

import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react'
import {Link} from 'react-router-dom'

class Register extends React.Component {

  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [], 
    loading: false,
    usersRef: firebase.database().ref('users')
  }

  // On verifie que le formulaire soit valide
  isFormValid = () => {
    let errors = []
    let error
    // Si le formulaire est vide
    if (this.isFormEmpty(this.state)) {
      // On affiche un message d'erreur
      error = {message : 'Merci de remplir chaque champ'}
      this.setState({ errors: errors.concat(error) })
      return false
      // Si le mot de passe est invalide
    } else if (!this.isPasswordValid(this.state)) {
      // On affiche un message d'erreur
      error = { message: 'Le mot de passe est invalide' }
      this.setState({ errors: errors.concat(error) })
      return false
    } else {
      // le formulaire est valide
      return true;
    }
  }

  isFormEmpty = ({username, email, password, passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  }

  isPasswordValid = ({ password, passwordConfirmation }) => {
    // On verifie que le mot passe fasse 6 caracteres
    if(password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    // On verifie que le mot de passe soit identique a la confirmation
    } else if (password !== passwordConfirmation){
      return false;
      // Le formulaire est valide
    } else {
      return true
    }
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
      firebase
        .auth()
        // On crée un utilisateur grace a son mail et son mot de passe
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          // console.log(createdUser)
          // On met a jour le profil utilisateur en stockant son nom et sa photo de profil
          createdUser.user.updateProfile({
            displayName: this.state.username,
            photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
          .then(()=>{
            // on enregistre l'utilisateur
            this.saveUser(createdUser)
            .then(()=>{
              console.log('Utilisateur enregistré')
            })
          })
          .catch(err => {
            console.log(err)
            this.setState({errors: this.state.errors.concat(err), loading: false})
          })
        })
        .catch(err => {
          console.error(err)
          this.setState({ errors: this.state.errors.concat(err), loading: false })
        })
  }}

  saveUser = createdUser => {
    // On definit le nom et l'avatar de l'utilisateur créee
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    })
  }

  handleInputError = (errors, inputName) => {
    // On change visuellement le champ qui contient un erreur en ajoutant la classe erreur
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
  }

  render() {

    const {username, email, password, passwordConfirmation, errors, loading} = this.state

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
              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Confirmation du mot de passe"
                onChange={this.handleChange}
                type="password"
                value={passwordConfirmation}
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
            Deja utilisateur ? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;