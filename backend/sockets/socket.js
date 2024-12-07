// const { Server } = require("socket.io");
// const onlineUsers = new Map(); // To track online users

// function initializeSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: "*", // Adjust the origin based on your frontend URL
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // When a user comes online
//     socket.on("userOnline", async (userId) => {
//       onlineUsers.set(userId, socket.id); // Map userId to socketId

//       //when user got online then push all the undelievered messages to the user (messages those came when user was offline)

//       //get undeliveredMessages
//       const undeliveredMessages = await Message.find({
//         receiver: userId,
//         delivered: false,
//       });

//       undeliveredMessages.forEach((message) => {
//         socket.emit("receiveMessage", message); //emit receiveMessage only when the user have any undeliever message
//         message.delivered = true;
//         message.save(); // Mark as delivered
//       });

//       console.log(`${userId} is online.`);
//       io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Notify all clients of online users
//       //   console.log(onlineUsers)
//     });



//     socket.on('joinChat', ({ chatId, chatType }) => {
//         if (chatType === 'one-to-one') {
//           socket.join(`oneToOneChat:${chatId}`);
//         } else if (chatType === 'group') {
//           socket.join(`groupChat:${chatId}`);
//         }
//       });




//     // When a user sends a message
//     socket.on('sendMessage', async (message) => {
//         try {
//           // Save the message to the database
//           const newMessage = await Message.create({
//             sender: message.sender,
//             receiver: message.receiver,
//             content: message.content,
//             messageType: message.messageType,
//             chat: message.chatId, // Reference to the chat
//           });
    
//           // Update the lastMessage field in the Chat model
//           await Chat.findByIdAndUpdate(message.chatId, {
//             lastMessage: newMessage._id,
//             updatedAt: Date.now(),
//           });

//         //   put this create message and updatechat model in controllers
    
//           // Deliver the message to the receiver
//           const receiverSocketId = onlineUsers.get(message.receiver);
//           if (receiverSocketId) {
//             io.to(receiverSocketId).emit('receiveMessage', newMessage);
//           }
//         } catch (error) {
//           console.error('Error sending message:', error);
//         }
//       });









  

//     // When a user disconnects
//     socket.on("disconnect", () => {
//       let disconnectedUserId;
//       onlineUsers.forEach((value, key) => {
//         if (value === socket.id) {
//           disconnectedUserId = key;
//           onlineUsers.delete(key); // Remove user from onlineUsers
//         }
//       });

//       if (disconnectedUserId) {
//         console.log(`${disconnectedUserId} went offline.`);
//         io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Notify clients
//       }
//     });
//   });
// }

// module.exports = { initializeSocket };





const { Server } = require("socket.io");
const onlineUsers = new Map(); // To track online users

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust the origin based on your frontend URL
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Load socket event handlers
    require('./socketHandlers/userEvents')(io, socket, onlineUsers);
    require('./socketHandlers/chatEvents')(io, socket, onlineUsers);
    require('./socketHandlers/messageEvents')(io, socket, onlineUsers);
  });
}

module.exports = { initializeSocket };
