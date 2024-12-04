const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
  groupName: { type: String, required: true }, // Name of the group
  groupImage: { type: String }, // Optional image URL for the group
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Array of user IDs
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }, // Reference to the last message
  updatedAt: { type: Date, default: Date.now }, // Update timestamp
}, { timestamps: true });

module.exports = mongoose.model('GroupChat', groupChatSchema);



// Note: Group Chat functionality is not yet in the requirement but for in future if client needs to implement groupChat
// functionality then we will use this group chat model