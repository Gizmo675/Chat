import React from 'react';
import firebase from '../../firebase'
import { Segment, Comment } from 'semantic-ui-react' 

import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'

class Messages extends React.Component {

  state = {
    messageRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser
  }

  render() {

    const { messageRef, channel, user } = this.state
    
    return (
      <>
        <MessagesHeader />

        <Segment>
          <Comment.Group className='messages' >
            {/* Messages */}
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