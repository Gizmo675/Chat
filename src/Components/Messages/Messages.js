import React from 'react';
import firebase from '../../firebase'
import { Segment, Comment } from 'semantic-ui-react' 

import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import Message from './Message'

class Messages extends React.Component {

  state = {
    messageRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: []
  }

  componentDidMount() {
    const { channel, user } = this.state
    if(channel && user) {
      this.addListeners(channel.id)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
  }

  addMessageListener = channelId => {
    let loadedMessages = []
    this.state.messageRef.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val())
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
    })
  }

  displayMessages = messages => (
    messages.length > 0 && messages.map(message => (
      <Message 
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))
  )

  render() {

    const { messageRef, channel, user, messages } = this.state
    
    return (
      <>
        <MessagesHeader />

        <Segment size='large'>
          <Comment.Group className='messages' >
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessagesForm
          messageRef={messageRef}
          currentChannel={channel}
          currentUser={user}
        />
      </>
    )
  }
}

export default Messages