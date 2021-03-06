import React from 'react';
import firebase from '../../firebase'
import {connect} from 'react-redux'
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';

// Actions
import {setCurrentChannel, setPrivateChannel} from '../../actions'

class Channels extends React.Component {
  
  state = {
    user: this.props.currentUser,
    channels: [],
    channelName: '',
    channel: null,
    channelDetails: '',
    modal: false,
    firstLoad: true,
    activeChannel: '',
    notifications: [],
    channelsRef: firebase.database().ref('channels'),
    messagesref: firebase.database().ref('messages'),
    typingRef: firebase.database().ref('typing')
  }

  componentDidMount() {
    this.addListeners()
  }

  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      this.setState({ channels: loadedChannels}, () => this.setFirstChannel())
      this.addNotificationListener(snap.key)
    })
  }

  addNotificationListener = channelId => {
    this.state.messagesref.child(channelId).on('value', snap => {
      if(this.state.channel) {
        this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
      }
    })
  }

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0
    let index = notifications.findIndex(notification => notification.id ===channelId )
    if(index !== -1) {
      if(channelId !== currentChannelId) {
        lastTotal = notifications[index].total
        if(snap.numChildren() - lastTotal>0){
          notifications[index].count = snap.numChildren() - lastTotal
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren()
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      })
    }
    this.setState({ notifications })
  }

  removeListeners = () => {
    this.state.channelsRef.off()
    this.state.channels.forEach(channel => {
      this.state.messagesref.child(channel.id).off()
    })
  }

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0]
    if(this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
      this.setState({ channel: firstChannel })
    }
    this.setState({firstLoad: false})
  }

  handleSubmit = event => {
    event.preventDefault()
    if(this.isFormValid(this.state)) {
      this.addChannel()
    }
  }

  addChannel = () => {
    const { channelsRef, channelDetails, channelName, user } = this.state
    const key= channelsRef.push().key
    const newChannel = {
      id: key,
      name: channelName, 
      details: channelDetails, 
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    }
    channelsRef
    .child(key)
    .update(newChannel)
    .then(()=>{
      this.setState({ channelName:'', channelDetails:'' })
      this.closeModal()
      console.log('chaine ajouté')
    })
    .catch(err=>{
      console.error(err)
    })
  }

  displayChannels = channels => (
    channels.length > 0 && channels.map(channel => (
      <Menu.Item
      key={channel.id}
      name={channel.name}
      onClick={()=> this.changeChannel(channel)}
      style={{ opacity: 0.7 }}
      active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color='red'>{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ))
  )

  getNotificationCount = channel => {
    let count = 0
    this.state.notifications.forEach(notification => {
      if(notification.id === channel.id) {
        count = notification.count
      }
    })
    if(count>0) return count
  }

  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove()
    this.clearNotifications()
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
    this.setState({ channel })
  }

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)
    if(index !== -1) {
      let updatedNotifications = [...this.state.notifications]
      updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal
      updatedNotifications[index].count = 0
      this.setState({ notifications: updatedNotifications })
    }
  }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }
  

  isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails

  closeModal = () => {
    this.setState({ modal:false })
  }
  openModal = () => {
    this.setState({ modal:true })
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    
    const {channels, modal} = this.state

    return ( 
      <>
      <Menu.Menu className='menu' >
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHAINES
          </span>{' '}
          ({channels.length}) <Icon name='add' onClick={this.openModal} />
        </Menu.Item>
        {this.displayChannels(channels)}
      </Menu.Menu>

      {/* Ajouter une chaine */}
      <Modal basic open={modal} onClose={this.closeModal} >
        <Modal.Header>
          Ajouter une chaine
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <Input
                fluid
                label='Nom de la chaine'
                name='channelName'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Input
                fluid
                label='Description de la chaine'
                name='channelDetails'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' inverted onClick={this.handleSubmit}>
            <Icon name='checkmark' /> Ajouter
          </Button>
          <Button color='red' inverted  onClick={this.closeModal}>
            <Icon name='remove' /> Annuler
          </Button>
        </Modal.Actions>
      </Modal>
      </>
     );
  }
}
 
export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);