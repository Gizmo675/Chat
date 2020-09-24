import React from 'react';
import firebase from '../../firebase'
import { v4 as uuidv4 } from 'uuid';
import { Segment, Button, Input } from 'semantic-ui-react'

import FileModal from './FileModal'

class MessagesForm extends React.Component {
  state = { 
    message: '',
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    loading: false,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    percentUploaded: 0
   }

   openModal = () => this.setState({ modal: true })
   closeModal = () => this.setState({ modal: false })

   handleChange = event => {
     this.setState({ [event.target.name]: event.target.value })
   }

   createMessage = (fileURL=null) => {
     const message = {
       timestamp: firebase.database.ServerValue.TIMESTAMP,
       user: {
         id: this.state.user.uid,
         name: this.state.user.displayName,
         avatar: this.state.user.photoURL
       },
       content: this.state.message,
     }
     if(fileURL !== null) {
       message['image'] = fileURL
     } else {
       message['content'] = this.state.message
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

   uploadFile = (file, metadata) => {
     const pathToUpload = this.state.channel.id
     const ref = this.props.messageRef
     const filePath = `chat/public/${uuidv4()}.jpg`

     this.setState({
       uploadState: 'uploading',
       uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
     },
     ()=> {
        this.state.uploadTask.on('state_changed', snap => {
         const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100)
         this.setState({ percentUploaded })
       },
       err => {
         console.error(err)
         this.setState({
           errors: this.state.errors.concat(err),
           uploadState: 'error',
           uploadTask: null
         })
       },
        () => {
          this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            this.sendFileMessage(downloadURL, ref, pathToUpload)
          })
          .catch(err => {
          console.error(err)
          this.setState({
            errors: this.state.errors.concat(err),
            uploadState: 'error',
            uploadTask: null
          })
          })
        }
      )
    })
  }

  sendFileMessage = (fileURL, ref, pathToUpload) => {
    ref.child(pathToUpload)
      .push()
      .set(this.createMessage(fileURL))
      .then(()=>{
        this.setState({uploadState: 'done'})
      })
      .catch(err=> {
        console.error(err)
        this.setState({
          errors: this.state.errors.concat(err)
        })
      })
  }

  render() { 

    const {errors, message, loading, modal} = this.state

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
          onClick={this.openModal}
          content='Ajouter un media'
          labelPosition='right'
          icon='cloud upload'
        />
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
      </Button.Group>
      </Segment>
     );
  }
}
 
export default MessagesForm;