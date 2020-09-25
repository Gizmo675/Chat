import React from 'react';
import firebase from '../../firebase'
import {connect} from 'react-redux'
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

// Actions
import {setCurrentChannel, setPrivateChannel} from '../../actions'

class Channels extends React.Component {
  
  state = {
    user: this.props.currentUser,
    channels: [],
    channelName: '',
    channelDetails: '',
    modal: false,
    channelsRef: firebase.database().ref('channels'),
    firstLoad: true,
    activeChannel: ''
  }

  componentDidMount() {
    this.addListeners()
  }

  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      this.setState({ channels: loadedChannels}, () => this.setFirstChannel())
    })
  }

  setFirstChannel = () => {
    const firstChannel = this.state.channels[0]
    if(this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
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
        # {channel.name}
      </Menu.Item>
    ))
  )

  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
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