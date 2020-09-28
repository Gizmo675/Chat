import React from 'react';
import { connect } from 'react-redux'
import firebase from '../../firebase'
import { 
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from 'semantic-ui-react'
import { SliderPicker } from 'react-color'

// Actions
import { setColors } from '../../actions'

class ColorPanel extends React.Component {

  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    userColors: []
  }

  handleChangePrimary = color => this.setState({primary: color.hex})
  handleChangeSecondary = color => this.setState({secondary: color.hex})

  handleSavedColors = () => {
    if(this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary)
    }
  }

  saveColors = (primary, secondary) => {
    this.state.usersRef
    .child(`${this.state.user.uid}/colors`)
    .push()
    .update({
      primary,
      secondary
    })
    .then(()=> {
      console.log('Couleurs ajouté');
      this.closeModal()
    })
    .catch(err => console.error(err))
  }
  
  openModal = () => this.setState({modal: true})
  closeModal = () => this.setState({modal: false})

  componentDidMount() {
    if(this.state.user) {
      this.addListener(this.state.user.uid)
    }
  }

  addListener = userId => {
    let userColors = []
    this.state.usersRef
    .child(`${userId}/colors`)
    .on('child_added', snap=> {
      userColors.unshift(snap.val())
      this.setState({ userColors})
    })
  }

  displayUserColors = colors => (
    colors.length>0 && colors.map((color, i)=>(
      <React.Fragment key={i}>
        <Divider />
        <div 
          className="color__container"
          onClick={()=> this.props.setColors(color.primary, color.secondary)}
        >
          <div className="color__square" style={{background: color.primary}} >
            <div className="color__overlay" style={{background: color.secondary}} />
          </div>
        </div>
      </React.Fragment>
    ))
  )

  render() {

    const { modal, primary, secondary, userColors } = this.state

    return (
      <Sidebar
        as={Menu}
        icon='labeled'
        inverted
        vertical
        visible
        width='very thin'
      >
        <Divider />
        <Button
          icon='add'
          size='small'
          color='pink'
          onClick={this.openModal}
        />
        {this.displayUserColors(userColors)}

        {/* Color picker modal */}
        <Modal basic open={modal} onClose={this.closeModal} >
          <Modal.Header>
            Choisissez votre couleur
          </Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content='Couleur primaire' />
              <SliderPicker color={primary} onChange={this.handleChangePrimary} />
            </Segment>
            <Segment inverted>
              <Label content='couleur secondaire' />
              <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' inverted  onClick={this.handleSavedColors} >
              <Icon name='checkmark'>Sauvegarder votre couleur</Icon>
            </Button>
            <Button color='red' inverted onClick={this.closeModal} >
              <Icon name='remove'>Annuler</Icon>
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default connect(null, {setColors})(ColorPanel)