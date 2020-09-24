import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react'

class MessagesForm extends React.Component {
  state = {  }
  render() { 
    return ( 
      <Segment className='message__form' >
        <Input
          fluid
          name='message'
          style={{ marginBottom: '0.7em' }}
          label={<Button icon={'add'} />}
          labelPosition='left'
          placeholder='Entrer votre message'
      />
      <Button.Group icon widths='2' >
        <Button
          color='blue'
          content='repondre'
          labelPosition='left'
          icon='edit'
        />
        <Button
          color='teal'
          content='Ajouter un media'
          labelPosition='right'
          icon='cloud upload'
        />
      </Button.Group>
      </Segment>
     );
  }
}
 
export default MessagesForm;