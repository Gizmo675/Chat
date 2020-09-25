import React from 'react';
import { Menu } from 'semantic-ui-react'

// Componsant
import UserPanel from './UserPanel'
import Channels from './Channels'
import DirectMessages from './DirectMessages';

class SidePanel extends React.Component {

  render() {

    const { currentUser } = this.props

    return (
      <Menu
        size='large'
        inverted
        fixed='left'
        vertical
        style={{ background: '#00416A', fontSize:'1.2rem' }}
      >
        <UserPanel currentUser={currentUser} />
        <Channels currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
      </Menu>
    )
  }
}

export default SidePanel;