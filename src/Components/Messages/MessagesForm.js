import React from 'react';
import firebase from '../../firebase'
import { Segment, Button, Input } from 'semantic-ui-react'

class MessagesForm extends React.Component {
  state = { 
    message: '',
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    loading: false,
    errors: []
   }

   handleChange = event => {
     this.setState({ [event.target.name]: event.target.value })
   }

   createMessage = () => {
     const message = {
       timestamp: firebase.database.ServerValue.TIMESTAMP,
       user: {
         id: this.state.user.uid,
         name: this.state.user.displayName,
         avatar: this.state.user.photoURL
       },
       content: this.state.message,
     }
     return message
   }

   sendMessage = () => {
    const { messageRef } = this.props
    const { message, channel } = this.state

     if(message) {
       // Send the message
       this.setState({ loading: true });
       messageRef
       .child(channel.id)
       .push()
       .set(this.createMessage())
       .then(()=> {
         this.setState({
           loading: false,
           message: '',
           errors: []
         })
       })
       .catch(err => {
         console.error(err)
         this.setState({
          loading: false,
          errors: this.state.errors.concat(err)  
         })
       })
     } else {
       this.setState({
         errors: this.state.errors.concat({
           message: `Merci d'ajouter un message`
         })
       })
     }
   }

  render() { 

    const {errors, message, loading} = this.state

    return ( 
      <Segment className='message__form' >
        <Input
          fluid
          name='message'
          onChange={this.handleChange}
          value={message}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon={'add'} />}
          labelPosition='left'
          className={
            errors.some(error => error.message.includes('message')) ? 'error' : ''
          }
          placeholder='Entrer votre message'
      />
      <Button.Group icon widths='2' >
        <Button
          onClick={this.sendMessage}
          disabled={loading}
          color='blue'
          content='repondre'
          labelPosition='left'
          icon='edit'
        />
        <Button
          color='teal'
          content='Ajouter un media'
          labelPosition='right'
          icon='cloud upload'
        />
      </Button.Group>
      </Segment>
     );
  }
}
 
export default MessagesForm;