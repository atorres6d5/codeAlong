const io = require('./index').io
const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED,
		LOGOUT, COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT,
		TYPING  } = require('../events')
const {createUser, createMessage, createChat} = require('../factories')

let connectedUsers = { }

let communityChat = createChat()


module.exports = function(socket){
  console.log('socket id: '+socket.id)


let sendMessageToChatFromUser;

let sendTypingFromUser;

  //Verify user name
  socket.on(VERIFY_USER, (nickname, callback)=>{

    if(isUser(connectedUsers, nickname)){
     callback({ isUser:true, user:null })
   }else{
     callback({ isUser:false, user:createUser({name:nickname})})
   }
  })

  //User Connects with username
	socket.on(USER_CONNECTED, (user)=>{
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user

		sendMessageToChatFromUser = sendMessageToChat(user.name)
		sendTypingFromUser = sendTypingToChat(user.name)

		io.emit(USER_CONNECTED, connectedUsers)
		console.log(connectedUsers);

	})

  socket.on(COMMUNITY_CHAT, (callback)=>{
		callback(communityChat)
	})

  socket.on('disconnect', ()=>{
    if("user" in socket){
      connectedUsers = removeUser(connectedUsers, socket.user.name)

      io.emit(USER_DISCONNECTED, connectedUsers)
      console.log('disconnect',connectedUsers);
    }
  })

  socket.on(LOGOUT, ()=>{
    connectedUsers = removeUser(connectedUsers, socket.user.name)
    io.emit(USER_DISCONNECTED, connectedUsers)
  })

  socket.on(MESSAGE_SENT, ({chatID, message})=>{
    console.log(chatID, message);
    sendMessageToChatFromUser(chatID, message)
  })

  socket.on(TYPING, ({chatID, isTyping})=>{
		sendTypingFromUser(chatID, isTyping)
	})

}

function sendMessageToChat(sender){
  return (chatID, message) =>{
    console.log(message, chatID);
    io.emit(`${MESSAGE_RECIEVED}-${chatID}`, createMessage({message, sender}))
  }
}


function sendTypingToChat(user){
	return (chatID, isTyping)=>{
		io.emit(`${TYPING}-${chatID}`, {user, isTyping})
	}
}

function isUser(userList, username){
  return username in userList
}

function addUser(userList, user){
  let newList = Object.assign({}, userList)
  newList[user.name] = user
  return newList
}

function removeUser(userList, username){
  let newList = Object.assign({}, userList)
  delete newList[username]
  return newList
}
