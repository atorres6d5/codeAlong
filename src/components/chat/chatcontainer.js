import React, { Component } from 'react';
import SideBar from './sidebar'
import {COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECIEVED, TYPING} from '../../events'
import ChatHeading from './chatheading'
import Messages from '../messages/messages'
import MessageInput from '../messages/messageinput'


export default class ChatContainer extends Component {
  constructor(props){
    super(props)
    this.state = {
      chats:[],
      activeChat:null
    }
  }

  componentDidMount(){
    const {socket} = this.props
    socket.emit(COMMUNITY_CHAT, this.resetChat)

  }

  resetChat = (chat) => {
    return this.addChat(chat, true)
  }

  addChat = (chat, reset)=>{
		const { socket } = this.props
		const { chats } = this.state

    const newChats = reset ? [chat] : [...chats, chat]
		this.setState({chats:newChats, activeChat:true ? chat:  this.state.activeChat})


		const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`
		const typingEvent = `${TYPING}-${chat.id}`

		 socket.on(typingEvent, this.updateTypingInChat(chat.id))
	   socket.on(messageEvent, this.addMessageToChat(chat.id))
	}

  addMessageToChat = (chatID)=>{
		return message => {
			const { chats } = this.state
			let newChats = chats.map((chat)=>{
				if(chat.id === chatID)
					chat.messages.push(message)
				return chat
			})

			this.setState({chats:newChats})
		}
	}

  updateTypingInChat = (chatID) => {
    return ({isTyping, user})=>{
      if(user !== this.props.user.name){
        const {chats} = this.state
        let newChats = chats.map((chat)=>{
          if(chat.id===chatID){
            if(isTyping && !chat.typingUsers.includes(user)){
              chat.typingUsers.push(user)
            }else if(!isTyping && chat.typingUsers.includes(user)){
              chat.typingUsers = chat.typingUsers.filter(u => u !== user)
            }
          }
          return chat
        })
        this.setState({chat:newChats})
      }
    }
  }

  sendMessage =(chatID, message)=>{
    console.log(chatID);
    const {socket} = this.props
    socket.emit(MESSAGE_SENT, {chatID, message})
  }

  sendTyping = (chatID, isTyping)=>{
    const {socket}= this.props
    socket.emit(TYPING, {chatID, isTyping})
  }

  setActiveChat = (activeChat)=>{
		this.setState({activeChat})
	}

  render() {

    const { user,  logout } = this.props
    const {chats, activeChat} = this.state
    return (
      <div className="container">
        <SideBar
          logout={logout}
          chats={chats}
          user={user}
          activeChat = {activeChat}
          setActiveChat = {this.setActiveChat}
        />
        <div className= "chat-room-container">
          {
            activeChat !== null ?  (
              <div className="chat-room">
                <ChatHeading name={activeChat.name} />
                <Messages
                  messages={activeChat.messages}
                  user={user}
                  typingUsers={activeChat.typingUsers}
                />
                <MessageInput
                  sendMessage={
                    (message)=>{
                      this.sendMessage(activeChat.id, message)
                    }
                  }
                  sendTyping={
                    (isTyping)=>{
                      this.sendTyping(activeChat.id, isTyping)
                    }
                  }
                />
              </div>
            ) : <div className='chat-room choose'>
              <h3> Choose a Chat!</h3>
            </div>
          }

        </div>
      </div>
    );
  }

}
