import React from 'react';
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions'
import { Menu, Icon } from 'semantic-ui-react'

class Starred extends React.Component {

  state = { 
    starredChannels: [],
    activeChannel: ''
   }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
  }

  displayChannels = StarredChannels => (
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
  )

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