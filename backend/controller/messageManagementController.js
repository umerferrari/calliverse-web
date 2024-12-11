const CustomError = require("../utils/customError.js");
const responseHandler = require("../utils/responseHandler.js");
const Message = require("../modals/messageManagementModel.js");
const Chat = require("../modals/chatManagementModel.js");
// const handleUploadedFiles = require ("../utils/handleUploadedFIles.js")
const User = require("../modals/userManagementModal");
const mongoose = require("mongoose");
const path = require("path");

// Utility function to handle file upload metadata
const handleUploadedFiles = (files) => {
  return files.map((file) => {
    let fileType;

    // Determine the file type based on mime type
    if (file.mimetype.startsWith("image/")) fileType = "image";
    else if (file.mimetype.startsWith("audio/")) fileType = "audio";
    else if (file.mimetype.startsWith("video/")) fileType = "video";
    else fileType = "document";

    // Return file metadata including URL, file type, size, etc.
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

// Upload controller
const uploadFiles = (req, res, next) => {
  try {
    // Ensure files are provided in the request
    if (!req.files || req.files.length === 0) {
      return responseHandler(
        res,
        400,
        "Media files are required for media messages"
      );
    }

    console.log(req.files);

    // Handle and extract metadata for the uploaded files
    const filesMetadata = handleUploadedFiles(req.files);

    return responseHandler(
      res,
      200,
      "Files uploaded successfully",
      filesMetadata
    );
  } catch (error) {
    next(
      error instanceof CustomError ? error : new CustomError(error.message, 500)
    );
  }
};

// Create message method
const createMessage = async ({
  chatId,
  senderId,
  receiverId,
  messageType,
  content,
  files,
}) => {
  // Fetch chat
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found.");
  }

  // Check participants
  const participants = chat.participants.map((id) => id.toString());
  if (!participants.includes(senderId) || !participants.includes(receiverId)) {
    throw new Error("Sender or receiver is not part of this chat.");
  }

  let newMessage;

  if (messageType === "media") {
    if (!files || files.length === 0) {
      throw new Error("Media files are required for media messages.");
    }

    //this will be used when we want to directly create new message through new messagecontroller
    // const filesMetadata = handleUploadedFiles(files);

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
      throw new Error("Text content is required for text messages.");
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
    throw new Error("Invalid message type or missing required fields.");
  }

  await newMessage.save();

  // Update chat's last message
  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: newMessage._id,
    updatedAt: Date.now(),
  });

  return newMessage;
};

// Create new message with uploaded files
const newMessage = async (req, res, next) => {
  try {
    const { chatId, senderId, receiverId, messageType, content } = req.body;
    const files = req.files || [];

    const message = await createMessage({
      chatId,
      senderId,
      receiverId,
      messageType,
      content,
      files,
    });

    return responseHandler(res, 200, "Message created successfully.", message);
  } catch (error) {
    next(
      error instanceof CustomError ? error : new CustomError(error.message, 500)
    );
  }
};

// Get undelivered messages (same as before)
const getUndeliveredMessages = async (receiverId) => {
  try {
    const undeliveredMessages = await Message.find({
      receiverId,
      delivered: false,
    });

    return {
      undeliveredMessages,
    };
  } catch (error) {
    next(
      error instanceof CustomError ? error : new CustomError(error.message, 500)
    );
  }
};

module.exports = {
  uploadFiles, // Export the upload controller
  createMessage,
  newMessage,
  getUndeliveredMessages,
};
