import React from 'react';
import { Header, Segment, Icon, Input } from 'semantic-ui-react'

class MessagesHeader extends React.Component {
  state = {  }
  render() {

    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      handleStar,
      isChannelStarred
    } = this.props

    return ( 
      <Segment clearing>
        {/* Channel title */}
        <Header fluid='true' as='h2' floated="left" style={{ marginBottom: 0}} >
          <span>
            {channelName}
            {!isPrivateChannel && (
            <Icon
              onClick={handleStar}
              name={isChannelStarred ? 'star' : 'star outline'}
              color={isChannelStarred ? 'yellow' : 'black'}
            />
            )}
          </span>
          <Header.Subheader>
            {numUniqueUsers}
          </Header.Subheader>
        </Header>

        {/* Channel search input */}
        <Header floated='right'>
          <Input
          loading={searchLoading}
            onChange={handleSearchChange}
            size='mini'
            icon='search'
            name='searchTerm'
            placeholder='Chercher un message'
          >
          </Input>
        </Header>
      </Segment>
     );
  }
}
 
export default MessagesHeader;