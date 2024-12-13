const CustomError = require("../utils/customError.js");
const Message = require("../modals/messageManagementModel.js");
const Chat = require("../modals/chatManagementModel.js");
const deleteFile= require("../utils/deleteFile-Helper.js")
// Utility function to handle file upload metadata
const handleUploadedFiles = (files) => {
  return files.map((file) => {
    let fileType;

    if (file.mimetype.startsWith("image/")) fileType = "image";
    else if (file.mimetype.startsWith("audio/")) fileType = "audio";
    else if (file.mimetype.startsWith("video/")) fileType = "video";
    else fileType = "document";

    return {
      fileType: fileType,
      fileName: file.filename,
      fileUrl: `http://localhost:3003/uploads/${
        file.destination.split("uploads/")[1]
      }/${file.filename}`,
      fileSize: file.size,
      duration: file.mimetype.startsWith("audio/") ? file.duration : undefined,
    };
  });
};

// Create a new message
const createMessage = async ({
  chatId,
  senderId,
  receiverId,
  messageType,
  content,
  files,
}) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new CustomError("Chat not found.", 404);
  }

  const participants = chat.participants.map((id) => id.toString());
  if (!participants.includes(senderId) || !participants.includes(receiverId)) {
    throw new CustomError("Sender or receiver is not part of this chat.", 403);
  }

  let newMessage;
  if (messageType === "media") {
    if (!files || files.length === 0) {
      throw new CustomError("Media files are required for media messages.", 400);
    }

    newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      messageType: "media",
      content: content || null,
      files,
      timestamp: Date.now(),
    });
  } else if (messageType === "text") {
    if (!content) {
      throw new CustomError("Text content is required for text messages.", 400);
    }

    newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      messageType: "text",
      content,
      timestamp: Date.now(),
    });
  } else {
    throw new CustomError("Invalid message type or missing required fields.", 400);
  }

  await newMessage.save();

  // Update the chat's last message
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: newMessage._id,
    updatedAt: Date.now(),
  });

  return newMessage;
};

// Get undelivered messages
const getUndeliveredMessages = async (receiverId) => {
  return await Message.find({ receiverId, delivered: false });
};


const deleteMediaFile = async (fileUrl) => {
    try {
      if (!fileUrl || typeof fileUrl !== "string") {
        throw new CustomError("Invalid file URL provided", 400);
      }
  
      // Remove the base URL if present
    const baseUrl = process.env.BASE_URL || "http://localhost:3003";

    // Remove the base URL dynamically
    const relativePath = fileUrl.replace(baseUrl, "");
      console.log("File URL:", fileUrl);
      console.log("Relative path for deletion:", relativePath);
  
      const deleteResult = deleteFile(relativePath);
  
      if (!deleteResult.success) {
        throw new CustomError(deleteResult.message || "File not found", 404);
      }
  
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      console.error("Error in deleteMediaFile:", error.message);
      return { success: false, message: error.message };
    }
  };

module.exports = {
  handleUploadedFiles,
  createMessage,
  getUndeliveredMessages,deleteMediaFile
};
