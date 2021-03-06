import React from 'react';
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions'
import { Menu, Icon } from 'semantic-ui-react'

class Starred extends React.Component {

  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    starredChannels: [],
    activeChannel: ''
   }

   componentDidMount() {
     if(this.state.user){
       this.addListerners(this.state.user.uid)
     }
   }

   componentWillUnmount() {
     this.removeListener()
   }

   removeListener = () => {
     this.state.usersRef.child(`${this.state.user.uid}/starred`).off()
   }

   addListerners = userId => {
     this.state.usersRef
     .child(userId)
     .child('starred')
     .on('child_added', snap => {
       const starredChannel = { id: snap.key, ...snap.val() }
       this.setState({
         starredChannels: [...this.state.starredChannels, starredChannel]
       })
     })

     this.state.usersRef
     .child(userId)
     .child('starred')
     .on('child_removed', snap => {
       const channelToRemove = { id: snap.key, ...snap.val() }
       const filteredChannels = this.state.starredChannels.filter(channel => {
         return channel.id !== channelToRemove.id
       })
       this.setState({ starredChannels: filteredChannels })
     })
   }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
  }

  displayChannels = StarredChannels => 
    StarredChannels.length > 0 && StarredChannels.map(channel => (
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

  render() { 

    const {starredChannels} = this.state

    return ( 
      <>
        <Menu.Menu className='menu' >
        <Menu.Item>
          <span>
            <Icon name="star" /> FAVORITES
          </span>{' '}
          ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    </>
     );
  }
}
 
export default connect(null, {setPrivateChannel, setCurrentChannel})(Starred);