const uuid = require('uuid')


const createUser = ({name= ""} = {})=>(
  {
    id:uuid(),
    name
  }
)


const createMessage = ({message="", sender=""} = { })=>(
  {
    id:uuid(),
    time:getTime(new Date(Date.now())),
    message,
    sender
  }
)

const createChat = ({messages=[], users=[], name="Community"}={})=>(
  {
    id:uuid(),
    name,
    users,
    messages,
    typingUsers:[]
  }
)


const getTime = (date) =>{
  return`${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
}

module.exports = {
  createChat,
  createUser,
  createMessage
}
