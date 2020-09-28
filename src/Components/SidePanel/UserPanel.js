import React from 'react';
import firebase from '../../firebase'
import AvatarEditor from 'react-avatar-editor'
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
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob:'',
    storageRef : firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    metadata: {
      contentTpe: 'image/jpeg'
    },
    uploadCroppedImage: ''
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

  handleChange = event => {
    const file = event.target.files[0]
    const reader = new FileReader()

    if(file) {
      reader.readAsDataURL(file)
      reader.addEventListener('load', ()=>{
        this.setState({ previewImage: reader.result })
      })
    }
  }

  handleCrop = () => {
    if(this.AvatarEditor) {
      this.AvatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageURL = URL.createObjectURL(blob)
        this.setState({
          croppedImage: imageURL,
          blob
        })
      })
    }
  }

  uploadCroppedImage = () => {
    const {storageRef, userRef, blob, metadata} = this.state
    storageRef
    .child(`avatars/user-${userRef.uid}`)
    .put(blob, metadata)
    .then(snap => {
      snap.ref.getDownloadURL().then(downloadURL => {
        this.setState({uploadCroppedImage: downloadURL}, ()=> 
          this.changeAvatar()
        )
      })
    })
  }

  changeAvatar = () => {
    this.state.userRef
    .updateProfile({
      photoURL: this.state.uploadCroppedImage
    })
    .then(()=>{
      // console.log('PhotoURL mise a jour');
      this.closeModal()
    })
    .catch(err => {
      console.error(err);
    })
    this.state.usersRef
    .child(this.state.user.uid)
    .update({ avatar: this.state.uploadCroppedImage })
    .then(()=>{
      // console.log('avatar mis a jour');
    })
    .catch(err => {
      console.error(err);
    })
  }
  
  render() { 
    const { user, modal, previewImage, croppedImage } = this.state
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
              onChange={this.handleChange}
            />
            <Grid centered stackable columns={2} >
              <Grid.Row centered>
                <Grid.Column className="ui center aligned grid">
                  {previewImage && (
                    <AvatarEditor
                      ref={node => (this.AvatarEditor = node)}
                      image={previewImage}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{margin: '3.5em auto'}}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && <Button color='green' inverted onClick={this.uploadCroppedImage}>
                <Icon name='save' /> changer d'avatar
              </Button>}
              <Button color='green' inverted onClick={this.handleCrop} >
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