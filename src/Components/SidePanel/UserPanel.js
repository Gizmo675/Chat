import React from 'react';
import firebase from '../../firebase'
import { Dropdown,
  Grid,
  Header,
  Icon,
  Image,
  Modal,
  Input,
  Button
} from 'semantic-ui-react'

class UserPanel extends React.Component {

  state = {
    user: this.props.currentUser,
    modal: false
  }

  openModal = () => this.setState({modal:true})
  closeModal = () => this.setState({modal:false})

  dropdownOptions = () => [
    {
      key:'user',
    text: <span>Enregistré sous <strong>{this.state.user.displayName}</strong></span>,
      disabled: true
    }, {
      key:'avatar',
      text: <span onClick={this.openModal}>Changer son avatar</span>
    }, {
      key:'signout',
      text: <span onClick={this.handleSignout} >Deconnexion</span>
    }
  ]

  handleSignout = () => {
    firebase
    .auth()
    .signOut()
    .then(()=>console.log('signed out!'))
  }
  
  render() { 
    const { user, modal } = this.state
    const {primaryColor} = this.props

    return ( 
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin:0 }} >

            {/* App Header */}
            <Header inverted floated='left' as='h2' >
              <Icon name='code' />
              <Header.Content>Chat</Header.Content>
            </Header>

            {/* User Dropdown */}
            <Header style={{padding: '0.25em'}} as='h4' inverted>
              <Dropdown trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar />
                  {user.displayName}
                </span>
              } options={this.dropdownOptions()} />
            </Header>
            
          </Grid.Row>
            
          {/* change avatar modal */}
          <Modal basic open={modal} onClose={this.closeModal} >
            <Modal.Header>Changer son avatar</Modal.Header>
            <Modal.Content>
              <Input 
              fluid 
              type='file' 
              label='nouvel avatar' 
              name='previewImage'
            />
            <Grid centered stackable columns={2} >
              <Grid.Row centered>
                <Grid.Column className="ui center aligned grid">
                  {/* Previsualisation */}
                </Grid.Column>
                <Grid.Column>
                  {/* Reduction */}
                </Grid.Column>
              </Grid.Row>
            </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green' inverted >
                <Icon name='save' /> changer d'avatar
              </Button>
              <Button color='green' inverted >
                <Icon name='image' /> Previsualisation
              </Button>
              <Button color='red' inverted onClick={this.closeModal} >
                <Icon name='remove' /> annuler
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
     )
  }
}
 
export default UserPanel;