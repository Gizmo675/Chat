import React from 'react';
import firebase from '../../firebase'
import { v4 as uuidv4 } from 'uuid';
import { Segment, Button, Input } from 'semantic-ui-react'
import { Picker, emojiIndex } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

import FileModal from './FileModal'
import ProgressBar from './ProgressBar';

class MessagesForm extends React.Component {
  state = { 
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref('typing'),
    message: '',
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    loading: false,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    percentUploaded: 0,
    emojiPicker: false
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

   sendMessage = event => {
     event.preventDefault()
    const { getMessagesRef } = this.props
    const { message, channel, typingRef, user } = this.state

     if(message) {
       // Send the message
       this.setState({ loading: true });
       getMessagesRef()
       .child(channel.id)
       .push()
       .set(this.createMessage())
       .then(()=> {
          this.setState({
            loading: false,
            message: '',
            errors: []
         })
         typingRef
          .child(channel.id)
          .child(user.uid)
          .remove()
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

   getPath = () => {
     if(this.props.isPrivateChannel) {
       return `chat/private-${this.state.channel.id}`
     } else {
       return 'chat/public'
     }
   }

   uploadFile = (file, metadata) => {
     const pathToUpload = this.state.channel.id
     const ref = this.props.getMessagesRef()
     const filePath = `${this.getPath()}/${uuidv4()}.jpg`

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

  handleKeyDown = () => {
    const {message, typingRef, channel, user} = this.state
    if(message) {
      typingRef
      .child(channel.id)
      .child(user.uid)
      .set(user.displayName)
    } else {
      typingRef
      .child(channel.id)
      .child(user.uid)
      .remove()
    }
  }

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker })
  }
  handleAddEmoji = emoji => {
    const oldMessage = this.state.message
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `)
    this.setState({ message: newMessage, emojiPicker: false })
  }

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g,'')
      let emoji = emojiIndex.emojis[x]
      if(typeof emoji !== 'undefined'){
        let unicode = emoji.native
        if(typeof unicode !== 'undefined'){
          return unicode
        }
      }
      x = ':' + x + ':'
      return x
    })
  }

  render() { 

    const {
      errors, 
      message, 
      loading, 
      modal, 
      uploadState, 
      percentUploaded, 
      emojiPicker
    } = this.state

    return ( 
      <Segment className='message__form' >
        <form onSubmit={this.sendMessage}>
          {emojiPicker && (
            <Picker 
              set='apple'
              className='emojipicker'
              title='choisissez un emoji'
              emoji='point_up'
              onSelect={this.handleAddEmoji}
            />
          )}
          <Input
            fluid
            name='message'
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            value={message}
            style={{ marginBottom: '0.7em' }}
            label={<Button icon={'add'} onClick={this.handleTogglePicker} />}
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
            disabled={uploadState === 'uploading'}
            onClick={this.openModal}
            content='Ajouter un media'
            labelPosition='right'
            icon='cloud upload'
          />
        </Button.Group>
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
          <ProgressBar 
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />

        </form>
      </Segment>
     );
  }
}
 
export default MessagesForm;