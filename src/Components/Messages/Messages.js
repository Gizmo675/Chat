import React from 'react';
import firebase from '../../firebase'
import { Segment, Comment } from 'semantic-ui-react' 
import {connect} from 'react-redux'

import {setUserPosts} from '../../actions'

// Composant
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import Message from './Message'
import Typing from './Typing'
import Skeleton from './Skeleton'

class Messages extends React.Component {

  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    connectedRef: firebase.database().ref('.info/connected'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: [],
    numUniqueUsers: '',
    searchTerm:'',
    searchLoading: false,
    searchResults: [],
    isChannelStarred: false,
    typingUsers: [],
    listeners: []
  }

  // lorsque le composant est monté, je passe l'id de la chaine a l'ecouteur
  componentDidMount() {
    const { channel, user, listeners } = this.state
    if(channel && user) {
      this.removeListeners(listeners)
      this.addListeners(channel.id)
      this.addUserStarsListener(channel.id, user.uid)
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners)
    this.state.connectedRef.off()
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.messagesEnd) {
      this.scrollToBottom()
    }
  }

  removeListeners = listeners => {
    listeners.forEach(listener=>{
      listener.ref.child(listener.id).off(listener.event)
    })
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event
    })
    if(index === -1) {
      const newListener = {id, ref, event}
      this.setState({listeners: this.state.listeners.concat(newListener)})
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
    this.addTypingListener(channelId)
  }

  addTypingListener = channelId => {
    let typingUsers = []
    this.state.typingRef
    .child(channelId)
    .on('child_added', snap => {
      if(snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        })
        this.setState({typingUsers})
      }
    })
    this.addToListeners(channelId, this.state.typingRef, 'child_added')
    this.state.typingRef
    .child(channelId)
    .on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key)
      if(index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key)
        this.setState({typingUsers})
      }
    })
    this.addToListeners(channelId, this.state.typingRef, 'child_removed')
    this.state.connectedRef
    .on('value', snap=>{
      if(snap.val() === true){
        this.state.typingRef
        .child(channelId)
        .child(this.state.user.uid)
        .onDisconnect()
        .remove(err=>{
          if(err !== null) {
            console.error(err);
          }
        })
      }
    })
  }

  addMessageListener = channelId => {
    let loadedMessages = []
    const ref = this.getMessagesRef()
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val())
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
      this.countUniqueUsers(loadedMessages)
      this.countUserPosts(loadedMessages)
    })
    this.addToListeners(channelId, ref, 'child_added')
  }

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message)=>{
      if(message.user.name in acc) {
        acc[message.user.name].count += 1 
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc
    }, {})
    this.props.setUserPosts(userPosts)
  }

  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
    .child(userId)
    .child('starred')
    .once('value')
    .then(data => {
      if(data.val() !== null) {
        const channelIds = Object.keys(data.val())
        const prevStarred = channelIds.includes(channelId)
        this.setState({ isChannelStarred: prevStarred })
      }
    })
  }

  // Je veux savoir si c'est un messages privés ou public
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state
    return privateChannel ? privateMessagesRef : messagesRef
  }

  handleStar= () => {
    this.setState(prevState => ({
      isChannelStarred: !prevState.isChannelStarred
    }), ()=>this.starChannel())
  }

  starChannel = () => {
    if(this.state.isChannelStarred) {
      this.state.usersRef
      .child(`${this.state.user.uid}/starred`)
      .update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      })
    } else {
      this.state.usersRef
      .child(`${this.state.user.uid}/starred`)
      .child(this.state.channel.id)
      .remove(err => {
        if(err !== null) {
          console.error(err)
        }
      })
    }
  }

  // Je veux savoir si il y a une recherche dans les messages
  handleSearchChange = event => {
    this.setState({
      // Je recupere la valeur de l'evenement
      searchTerm: event.target.value,
      // Je passe le state de chargement a vrai
      searchLoading: true
      // J'execute la methode
    }, ()=> this.handleSearchMessages())
  }

  // Je veux afficher les messages rechercher
  handleSearchMessages = () => {
    // Je recupere l'ensemble des messages
    const channelMessages = [...this.state.messages]
    // Case insensitive
    const regex = new RegExp(this.state.searchTerm, 'gi')
    // Je fais un reduce pour avoir les messages recherché
    const searchResults = channelMessages.reduce((acc, message) => {
      // si il y a un message contenant la recherche
      if((message.content && message.content.match(regex))
        ||
        // ou si il y a un utilisateur recherché
        message.user.name.match(regex) 
        ) {
          // je l'envoi dans le reduce
        acc.push(message)
      }
      return acc
    }, [])
    // je met a jour le state avec les messages recherchés
    this.setState({searchResults})
    // Je coupe le loader une seconde aprés la recherche
    setTimeout(()=> this.setState({searchLoading:false}), 1000)
  }

  // Je veux savoir combien d'utilisateur differents sont sur la chaine
  countUniqueUsers = messages => {
    // je fais un reduce pour avoir les message de chaque utilisateur
    const uniqueUsers = messages.reduce((acc, message) => {
      // si l'utilisateur n'est pas dans la liste
      if(!acc.includes(message.user.name)){
        // Je l'envoi dans la liste
        acc.push(message.user.name)
      }
      return acc
    },[])
    // Gestion du S si plusieurs utilisateur
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
    // Je compte le nombre d'utilisateur present dans le reduce
    const numUniqueUsers = `${uniqueUsers.length} utilisateur${plural?'s':''}`
    // Je met a jour le nombre d'utilisateur sur la chaine
    this.setState({numUniqueUsers})
  }
  
  // Je veux afficher chaque messages
  displayMessages = messages => (
    // Si il y a des messages, je boucle dessus
    messages.length > 0 && messages.map(message => (
      // J'affiche le message avec une clé, le contenu du message et son utilisateur
      <Message 
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))
  )
  
  // Je veux afficher les chaines
  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` :
    ''
  }

  displayTypingUsers = users => (
    users.length > 0 && users.map(user=> (
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em' }}
        key={user.id}
      >
        <span className="user__typing">
           {user.name} ecrit un message
        </span>
        <Typing />
      </div>
  ))
  )

  displayMessagesSkeleton = loading => (
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i)=>(
          <Skeleton key={i} />
        )
        )}
      </React.Fragment>
    ) : null
  )

  render() {

    const { 
      messageRef,
      channel,
      user,
      messages,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading
    } = this.state
    
    return (
      <>
        <MessagesHeader 
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment style={{height: '70vh', overflowY: 'scroll'}}>
          <Comment.Group className='messages' >
            {this.displayMessagesSkeleton(messagesLoading)}
            { searchTerm ?
               this.displayMessages(searchResults) :
               this.displayMessages(messages)
            }
          {this.displayTypingUsers(typingUsers)}
          <div ref={node => (this.messagesEnd = node)} />
          </Comment.Group>
        </Segment>
        <MessagesForm
          messageRef={messageRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    )
  }
}

export default connect(null, {setUserPosts})(Messages)