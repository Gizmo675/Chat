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
    messages: [],
    numUniqueUsers: '',
    searchTerm:'',
    searchLoading: false,
    searchResults: []
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
      this.countUniqueUsers(loadedMessages)
    })
  }

  handleSearchChange = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, ()=> this.handleSearchMessages())
  }

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages]
    const regex = new RegExp(this.state.searchTerm, 'gi')
    const searchResults = channelMessages.reduce((acc, message) => {
      if(message.content && message.content.match(regex)) {
        acc.push(message)
      }
      return acc
    }, [])
    this.setState({searchResults})
  }

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if(!acc.includes(message.user.name)){
        acc.push(message.user.name)
      }
      return acc
    },[])
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0 
    const numUniqueUsers = `${uniqueUsers.length} utilisateur${plural?'s':''}`
    this.setState({numUniqueUsers})
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

  displayChannelName = channel => channel ? `#${channel.name}` : ''

  render() {

    const { 
      messageRef,
      channel,
      user,
      messages,
      numUniqueUsers,
      searchTerm,
      searchResults
    } = this.state
    
    return (
      <>
        <MessagesHeader 
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
        />

        <Segment>
          <Comment.Group className='messages' >
            { searchTerm ?
               this.displayMessages(searchResults) :
               this.displayMessages(messages)
            }
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