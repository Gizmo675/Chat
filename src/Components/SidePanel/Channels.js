import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends React.Component {
  
  state = {
    Channels: [],
    channelName: '',
    channelDetails: '',
    modal: false
  }

  handleSubmit = event => {
    event.preventDefault()
    if(this.isFormValid(this.state)) {
      console.log('chaine ajouté')
    }
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