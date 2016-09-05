import {Map, List} from 'immutable';

export const initialState = Map({
  serverDetails: Map({
    connecting: false,
    connected: false,
    error: null,
    host: null,
    nick: null,
  }),
  welcomeMessage: null,
  serverMessages: List(),
  channels: Map(),
  activeChannel: null,
});

export default function(state, action) {
  switch (action.type) {
    case 'CONNECTING_TO_SERVER':
      return connectingToServer(state, action);
    case 'CONNECTED_TO_SERVER':
      return connectedToServer(state, action);
    case 'SERVER_ERROR':
      return serverError(state, action);
    case 'WELCOME_MESSAGE':
      return welcomeMessage(state, action);
    case 'MESSAGE_SENT':
      return messageSent(state, action);
    case 'JOINED_CHANNEL':
      return joinedChannel(state, action);
    case 'CHANNEL_TOPIC':
      return channelTopic(state, action);
    case 'CHANNEL_USERS':
      return channelUsers(state, action);
    case 'USER_JOINED_CHANNEL':
      return userJoinedChannel(state, action);
    case 'USER_PARTED_CHANNEL':
      return userPartedChannel(state, action);
    case 'CHANNEL_MESSAGE':
      return channelMessage(state, action);
    case 'PARTED_CHANNEL':
      return partedChannel(state, action);
    default:
      return state;
  }
}

function connectingToServer(state) {
  return state.setIn(['serverDetails', 'connecting'], true);
}

function connectedToServer(state, {host, nick}) {
  return state.mergeIn(['serverDetails'], {
    connecting: false,
    connected: true,
    host,
    nick
  });
}

function serverError(state, {error}) {
  return state.mergeIn(['serverDetails'], {
    connecting: false,
    connected: false,
    error,
  });
}

function welcomeMessage(state, {welcomeMessage}) {
  return state.set('welcomeMessage', welcomeMessage);
}

function messageSent(state, {channel, message}) {
  if (!channel) {
    return state.updateIn(['serverMessages'],
      serverMessages => serverMessages.push(Map({message}))
    );
  }

  return state.updateIn(['channels', channel, 'messages'],
    messages => messages.push(Map({
      message,
      sender: state.getIn(['serverDetails', 'nick']),
    }))
  );
}

function joinedChannel(state, {channel}) {
  state = state
    .set('activeChannel', channel)
    .setIn(['channels', channel], Map({
      users: List(),
      messages: List(),
    }))
  ;

  return pushChannelStatusMessage(state, {
    channel,
    message: 'You joined channel ' + channel,
  });
}

function channelTopic(state, {channel, topic}) {
  state = state.setIn(['channels', channel, 'topic'], topic);

  return pushChannelStatusMessage(state, {
    channel,
    message: 'Topic: ' + topic,
  });
}

function channelUsers(state, {channel, users}) {
  return state.setIn(['channels', channel, 'users'], users);
}

function userJoinedChannel(state, {channel, joinedUser}) {
  state = state.updateIn(['channels', channel, 'users'],
    users => users.push(joinedUser)
  );

  return pushChannelStatusMessage(state, {
    channel,
    message: joinedUser + ' joined',
  });
}

function userPartedChannel(state, {channel, partedUser}) {
  state = state.updateIn(['channels', channel, 'users'],
    users => users.filter(user => user !== partedUser)
  );

  return pushChannelStatusMessage(state, {
    channel,
    message: partedUser + ' left',
  });
}

function channelMessage(state, {channel, sender, message}) {
  return state.updateIn(['channels', channel, 'messages'],
    messages => messages.push(Map({sender, message, type: 'user'}))
  );
}

function partedChannel(state, {channel}) {
  return state.deleteIn(['channels', channel]);
}

function pushChannelStatusMessage(state, {channel, message}) {
  return state.updateIn(['channels', channel, 'messages'],
    messages => messages.push(Map({message, type: 'status'}))
  );
}
