import React from 'react';
import { Segment,Accordion, Header, Icon, Image } from 'semantic-ui-react'

class MetaPanel extends React.Component {

  state = {
    activeIndex: 0,
    privateChannel: this.props.isPrivateChannel,
    channel: this.props.currentChannel
  }

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }

  render() {

    const {activeIndex, privateChannel, channel} = this.state

    if(privateChannel) return null

    return (

      <Segment loading={!channel} >
        <Header as='h3' attached='top' >
          A propos # {channel && channel.name}
        </Header>
        <Accordion styled attached='true'>
          {/* A propos de la Chaines */}
          <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='info' />
            Details de la chaine
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>
          {/* A propos des utilisateurs */}
          <Accordion.Title
          active={activeIndex === 1}
          index={1}
          onClick={this.setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='user circle' />
            Meilleurs participants 
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            participants
          </Accordion.Content>
          {/* a propos du createur */}
          <Accordion.Title
          active={activeIndex === 2}
          index={2}
          onClick={this.setActiveIndex}
          >
            <Icon name='dropdown' />
            <Icon name='pencil alternate' />
            Crée par
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as='h3' >
              <Image circular src={channel && channel.createdBy.avatar} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    )
  }
}

export default MetaPanel