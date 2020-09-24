import React from 'react';
import { Segment, Comment } from 'semantic-ui-react' 

import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'

class Messages extends React.Component {
  render() {
    return (
      <>
        <MessagesHeader />

        <Segment>
          <Comment.Group className='messages' >
            {/* Messages */}
          </Comment.Group>
        </Segment>
        <MessagesForm />
      </>
    )
  }
}

export default Messages