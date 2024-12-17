// const Message = require('../../modals/messageManagementModel');
// const getUndeliveredMessages = require('../../controller/messageManagementController')

// module.exports = (io, socket, onlineUsers) => {
//   // User comes online
//   socket.on("userOnline", async (userId) => {
//     onlineUsers.set(userId, socket.id);

//     // Fetch undelivered messages
//     const undeliveredMessages = await Message.find({ receiverId: userId, delivered: false });
//     console.log("underliever messages",undeliveredMessages)

//     const recipientSocketId = onlineUsers.get(userId); 
//     if (undeliveredMessages.length) {
//       undeliveredMessages.forEach((message) => {
//         io.to(recipientSocketId).emit("receiveMessage", message, (ack)=>{
//           if (ack?.success) {
//             console.log(
//               `Message ${message._id} successfully delivered to client.`
//             );
//           } else {
//             console.error(`Message ${message._id} delivery failed.`);
//           }
//         });
//         message.delivered = true;
//         message.save();
//       });
//     }

//     console.log(`${userId} is online.`);
//     io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//   });

//   // User disconnects
//   socket.on("disconnect", () => {
//     let disconnectedUserId;
//     onlineUsers.forEach((value, key) => {
//       if (value === socket.id) {
//         disconnectedUserId = key;
//         onlineUsers.delete(key);
//       }
//     });

//     if (disconnectedUserId) {
//       console.log(`${disconnectedUserId} went offline.`);
//       io.emit("onlineUsers", Array.from(onlineUsers.keys()));
//     }
//   });
// };

const Message = require('../../modals/messageManagementModel');
const getUndeliveredMessages = require('../../controller/messageManagementController');

module.exports = (io, socket, onlineUsers) => {
  // User comes online
  socket.on("userOnline", async (userId) => {
    try {
      onlineUsers.set(userId, socket.id);

      // Fetch undelivered messages
      const undeliveredMessages = await Message.find({
        receiverId: userId,
        delivered: false,
      });

      console.log("Undelivered messages:", undeliveredMessages);

      const recipientSocketId = onlineUsers.get(userId);
      if (undeliveredMessages.length) {
        undeliveredMessages.forEach((message) => {
          io.to(recipientSocketId).emit("receiveMessage", message, (ack) => {
            if (ack?.success) {
              console.log(
                `Message ${message._id} successfully delivered to client.`
              );
            } else {
              console.error(`Message ${message._id} delivery failed.`);
            }
          });
          message.delivered = true;
          message.save();
        });
      }

      console.log(`${userId} is online.`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    } catch (error) {
      console.error("Error in userOnline event:", error.message);
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    let disconnectedUserId;
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        disconnectedUserId = key;
        onlineUsers.delete(key);
      }
    });

    if (disconnectedUserId) {
      console.log(`${disconnectedUserId} went offline.`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
};
