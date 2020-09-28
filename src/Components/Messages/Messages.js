import React from 'react';
import firebase from '../../firebase'
import { Segment, Comment } from 'semantic-ui-react' 

// Composant
import MessagesHeader from './MessagesHeader'
import MessagesForm from './MessagesForm'
import Message from './Message'

class Messages extends React.Component {

  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    usersRef: firebase.database().ref('users'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messagesLoading: true,
    messages: [],
    numUniqueUsers: '',
    searchTerm:'',
    searchLoading: false,
    searchResults: [],
    isChannelStarred: false
  }

  // lorsque le composant est monté, je passe l'id de la chaine a l'ecouteur
  componentDidMount() {
    const { channel, user } = this.state
    if(channel && user) {
      this.addListeners(channel.id)
      this.addUserStarsListener(channel.id, user.uid)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
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
    })
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
      isChannelStarred
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
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    )
  }
}

export default Messages