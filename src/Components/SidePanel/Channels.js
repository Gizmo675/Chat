import React from 'react';
import firebase from '../../firebase'
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends React.Component {
  
  state = {
    user: this.props.currentUser,
    Channels: [],
    channelName: '',
    channelDetails: '',
    modal: false,
    channelsRef: firebase.database().ref('channels')
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
    
    const {Channels, modal} = this.state

    return ( 
      <>
      <Menu.Menu style={{ paddingBottom: '2em' }} >
        <Menu.Item>
          <span>
            <Icon name="exchange" /> CHAINES
          </span>{' '}
          ({Channels.length}) <Icon name='add' onClick={this.openModal} />
        </Menu.Item>
        {/* Channels */}
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
 
export default Channels;