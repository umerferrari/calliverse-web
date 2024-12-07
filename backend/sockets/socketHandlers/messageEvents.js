const { createMessage } = require('../../modals/messageManagementModel');
const Chat = require('../../modals/chatManagementModel');
const { handleUploadedFiles } = require('../../utils/handleUploadedFIles'); 

module.exports = (io, socket, onlineUsers) => {
  // Send message
  socket.on("sendMessage", async (message) => {
    try {
      const { chatId, senderId, receiverId, messageType, content } = message;
      const files = message.files || []; // Handle any files sent along with the message

      // If message type is "media", process the files
      let newMessage;
      if (messageType === "media" && files.length > 0) {
        // Process the files (file metadata)
        const filesMetadata = handleUploadedFiles(files);

        // Create the new message with media files
        newMessage = await createMessage({
          chatId,
          senderId,
          receiverId,
          messageType: "media",
          content, // Text content if any
          files: filesMetadata, // The processed file data
        });
      } else if (messageType === "text") {
        // For text messages, create a message without files
        newMessage = await createMessage({
          chatId,
          senderId,
          receiverId,
          messageType: "text",
          content,
          files: [], // No files in text messages
        });
      } else {
        throw new Error("Invalid message type or missing required fields.");
      }

      // Update the lastMessage field in the Chat model
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: Date.now(),
      });

      // Emit the message to all participants in the group (room)
      io.to(`groupChat:${chatId}`).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: error.message });
    }
  });
};
