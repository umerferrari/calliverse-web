const {
  createMessage,
} = require("../../controller/messageManagementController");
const Chat = require("../../modals/chatManagementModel");
const { handleUploadedFiles } = require("../../utils/handleUploadedFIles");

module.exports = (io, socket, onlineUsers) => {
  // Send message
  // socket.on("sendMessage", async (message) => {
  //   try {
  //     const { chatId, senderId, receiverId, messageType, content } = message;
  //     const files = message.files || []; // Handle any files sent along with the message

  //     // If message type is "media"
  //     let newMessage;
  //     if (messageType === "media" && files.length > 0) {
  //       //if message is media type then firstly media will be uploaded with /uploadMessageFiles and this api will return return the metadata of the uploaded media files and that metadate will come with the sendMessage Event
  //       const filesMetadata = files;

  //       // Create the new message with media files
  //       newMessage = await createMessage({
  //         chatId,
  //         senderId,
  //         receiverId,
  //         messageType: "media",
  //         content, // Text content if any
  //         files: filesMetadata, // The processed file data
  //       });
  //     } else if (messageType === "text") {
  //       // For text messages, create a message without files
  //       newMessage = await createMessage({
  //         chatId,
  //         senderId,
  //         receiverId,
  //         messageType: "text",
  //         content,
  //         files: [], // No files in text messages
  //       });
  //     } else {
  //       throw new Error("Invalid message type or missing required fields.");
  //     }

  //     // Update the lastMessage field in the Chat model
  //     await Chat.findByIdAndUpdate(chatId, {
  //       lastMessage: newMessage._id,
  //       updatedAt: Date.now(),
  //     });

  //     // Emit the message to all participants in the group (room)
  //     io.to(`groupChat:${chatId}`).emit("receiveMessage", newMessage);
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     socket.emit("error", { message: error.message });
  //   }
  // });

  // Server-side: socket.js
  socket.on("sendMessage", async (message, callback) => {
    try {
      const { chatId, senderId, receiverId, messageType, content } = message;
      const files = message.files || []; // Handle any files sent along with the message

      let newMessage;
      if (messageType === "media" && files.length > 0) {
        const filesMetadata = files;

        // Create the new message with media files
        newMessage = await createMessage({
          chatId,
          senderId,
          receiverId,
          messageType: "media",
          content,
          files: filesMetadata,
        });
      } else if (messageType === "text") {
        newMessage = await createMessage({
          chatId,
          senderId,
          receiverId,
          messageType: "text",
          content,
          files: [],
        });
      } else {
        throw new Error("Invalid message type or missing required fields.");
      }

      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: Date.now(),
      });

      // retrieve recipient's socket id
      const recipientSocketId = onlineUsers.get(receiverId);
      //emit this event if receiver is online
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", newMessage, (ack) => {
          if (ack?.success) {
            console.log(`Message ${newMessage._id} successfully delivered.`);
          } else {
            console.error(`Message ${newMessage._id} delivery failed.`);
          }
        });
      }

      // Send success confirmation to the sender
      if (callback) {
        callback({ success: true, messageId: newMessage._id });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Send error response to the sender
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  //acknowledgement event the message has been successfully reached to the receiver
  socket.on("messageReceived", async (response) => {
    
    console.log("Message delievered:", response);
  });
};
