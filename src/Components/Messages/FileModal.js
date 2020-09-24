import React from 'react';
import { Modal, Input, Button, Icon } from 'semantic-ui-react'

class FileModal extends React.Component {
  state = {  }
  render() { 

    const { modal, closeModal } = this.props

    return ( 
      <Modal basic open={modal} onClose={closeModal} >
        <Modal.Header>Selectionner un fichier</Modal.Header>
        <Modal.Content>
          <Input 
            fluid
            label='Type de fichiers: jpg, png...'
            name='file'
            type='file'
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            color='green'
            inverted
          >
            <Icon name='checkmark' />
            Envoyer
          </Button>
          <Button
            color='red'
            inverted
            onClick={closeModal}
          >
            <Icon name='remove' />
            Annuler
          </Button>
        </Modal.Actions>
      </Modal>
     );
  }
}
 
export default FileModal;