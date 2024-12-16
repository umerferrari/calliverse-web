// const {
//   createMessage,fetchAllMessages
// } = require("../../services/messageManagementService");
// const Chat = require("../../modals/chatManagementModel");
// const { handleUploadedFiles } = require("../../utils/handleUploadedFIles");
// const validateSocketRequest= require("../../middleware/socketValidator")
// const {getAllChatMessagesSchema}=require("../../DTO/MessageDTO")
// module.exports = (io, socket, onlineUsers) => {
//   socket.on("sendMessage", async (message, callback) => {
//     try {
//       const { chatId, senderId, receiverId, messageType, content } = message;
//       const files = message.files || []; // Handle any files sent along with the message

//       let newMessage;
//       if (messageType === "media" && files.length > 0) {
//         const filesMetadata = files;

//         // Create the new message with media files
//         newMessage = await createMessage({
//           chatId,
//           senderId,
//           receiverId,
//           messageType: "media",
//           content,
//           files: filesMetadata,
//         });
//       } else if (messageType === "text") {
//         newMessage = await createMessage({
//           chatId,
//           senderId,
//           receiverId,
//           messageType: "text",
//           content,
//           files: [],
//         });
//       } else {
//         throw new Error("Invalid message type or missing required fields.");
//       }

//       await Chat.findByIdAndUpdate(chatId, {
//         lastMessage: newMessage._id,
//         updatedAt: Date.now(),
//       });

//       // retrieve recipient's socket id
//       const recipientSocketId = onlineUsers.get(receiverId);
//       //emit this event if receiver is online
//       if (recipientSocketId) {
//         io.to(recipientSocketId).emit("receiveMessage", newMessage, (ack) => {
//           if (ack?.success) {
//             console.log(`Message ${newMessage._id} successfully delivered.`);
//           } else {
//             console.error(`Message ${newMessage._id} delivery failed.`);
//           }
//         });
//       }

//       // Send success confirmation to the sender
//       if (callback) {
//         callback({ success: true, messageId: newMessage._id });
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);

//       // Send error response to the sender
//       if (callback) {
//         callback({ success: false, error: error.message });
//       }
//     }
//   });



//   //acknowledgement event the message has been successfully reached to the receiver
//   socket.on("messageReceived", async (response) => {
    
//     console.log("Message delievered:", response);
//   });

// //getAllChatMessages
// socket.on(
//   'getAllChatMessages',
//   (payload, callback) => {
//     validateSocketRequest(getAllChatMessagesSchema)(payload, callback, async () => {
//       try {
//         const { chatId, page, limit } = payload.validatedData;
//         console.log('Chat ID:', chatId, 'Page:', page, 'Limit:', limit);

//         const result = await fetchAllMessages(chatId, parseInt(page, 10), parseInt(limit, 10));

//         callback({
//           success: true,
//           data: result,
//         });
//       } catch (error) {
//         console.error('Error fetching messages:', error.message);
//         callback({ success: false, error: error.message });
//       }
//     });
//   }
// );

// };







const {
  createMessage,
  fetchAllMessages,
} = require("../../services/messageManagementService");
const Chat = require("../../modals/chatManagementModel");
const { handleUploadedFiles } = require("../../utils/handleUploadedFIles");
const validateSocketRequest = require("../../middleware/socketValidator");
const { getAllChatMessagesSchema } = require("../../DTO/MessageDTO");
const CustomError = require("../../utils/customError");

module.exports = (io, socket, onlineUsers) => {
  /**
   * Event: sendMessage
   * Handles sending a message (text or media) between users.
   */
  socket.on("sendMessage", async (message, callback) => {
    try {
      const { chatId, senderId, receiverId, messageType, content } = message;
      const files = message.files || [];

      // Validate the message type and content
      if (!chatId || !senderId || !receiverId || !messageType) {
        throw new CustomError("Missing required fields in message.", 400);
      }

      let newMessage;

      if (messageType === "media" && files.length > 0) {
        const filesMetadata = files;

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
        throw new CustomError("Invalid message type.", 400);
      }

      // Update the chat with the last message
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: Date.now(),
      });

      // Retrieve recipient's socket ID
      const recipientSocketId = onlineUsers.get(receiverId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", newMessage, (ack) => {
          // if (ack?.success) {
          //   console.log(`Message ${newMessage._id} successfully delivered.`);
          // } else {
          //   console.error(`Message ${newMessage._id} delivery failed.`);
          // }
        });
      }

      // Send success confirmation to the sender
      if (callback) {
        callback({
          success: true,
          messageId: newMessage._id,
          message: "Message sent successfully.",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to send the message.",
        });
      }
    }
  });

  /**
   * Event: messageReceived
   * Acknowledges that the message has been received by the recipient.
   */
  socket.on("messageReceived", async (response) => {
    try {
      if (!response || !response.messageId) {
        throw new CustomError("Invalid response data.", 400);
      }
  
      // Optionally, update the message status in the database
      console.log(`Message ${response.messageId} delivered successfully.`);
    } catch (error) {
      console.error("Error in messageReceived event:", error.message);
    }
  });

  /**
   * Event: getAllChatMessages
   * Fetches all messages for a particular chat with pagination.
   */
  // socket.on("getAllChatMessages", (payload, callback) => {
  //   validateSocketRequest(getAllChatMessagesSchema)(
  //     payload,
  //     callback,
  //     async () => {
  //       try {
  //         const { chatId, page, limit } = payload.validatedData;

  //         if (!chatId || !page || !limit) {
  //           throw new CustomError(
  //             "chatId, page, and limit are required fields.",
  //             400
  //           );
  //         }

  //         const result = await fetchAllMessages(
  //           chatId,
  //           parseInt(page, 10),
  //           parseInt(limit, 10)
  //         );

  //         callback({
  //           success: true,
  //           data: result,
  //           message: "Messages fetched successfully.",
  //         });
  //       } catch (error) {
  //         console.error("Error fetching messages:", error.message);
  //         callback({
  //           success: false,
  //           error: error.message || "Failed to fetch messages.",
  //         });
  //       }
  //     }
  //   );
  // });



  // socket.on("getAllChatMessages", async (payload, callback) => {
  //   try {
  //     // Ensure callback is a function
  //     if (typeof callback !== "function") {
  //       console.error("Callback is missing or invalid.");
  //       return;
  //     }
  
  //     // Validate payload
  //     if (!payload || !payload.chatId || !payload.page || !payload.limit) {
  //       return callback({
  //         success: false,
  //         error: "chatId, page, and limit are required fields.",
  //       });
  //     }
  
  //     const { chatId, page, limit } = payload;
  
  //     // Fetch messages
  //     const result = await fetchAllMessages(
  //       chatId,
  //       parseInt(page, 10),
  //       parseInt(limit, 10)
  //     );
  
  //     // Send success response
  //     callback({
  //       success: true,
  //       data: result,
  //       message: "Messages fetched successfully.",
  //     });
  //   } catch (error) {
  //     console.error("Error fetching messages:", error.message);
  //     callback({
  //       success: false,
  //       error: error.message || "Failed to fetch messages.",
  //     });
  //   }
  // });
  



  socket.on("getAllChatMessages", async (payload, callback) => {
    try {
        if (!payload || !payload.chatId || !payload.page || !payload.limit) {
            return callback({
                success: false,
                error: "chatId, page, and limit are required fields.",
            });
        }

        const { chatId, page, limit } = payload;
        const result = await fetchAllMessages(chatId, parseInt(page, 10), parseInt(limit, 10));

        callback({
            success: true,
            data: result,
            message: "Messages fetched successfully.",
        });
    } catch (error) {
        callback({
            success: false,
            error: error.message || "Failed to fetch messages.",
        });
    }
});
};
