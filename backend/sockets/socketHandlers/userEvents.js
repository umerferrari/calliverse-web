const Message = require('../../modals/messageManagementModel');
const getUndeliveredMessages = require('../../controller/messageManagementController')

module.exports = (io, socket, onlineUsers) => {
  // User comes online
  socket.on("userOnline", async (userId) => {
    onlineUsers.set(userId, socket.id);

    // Fetch undelivered messages
    const undeliveredMessages = await Message.find({ receiverId: userId, delivered: false });
    console.log("underliever messages",undeliveredMessages)
    if (undeliveredMessages.length) {
      undeliveredMessages.forEach((message) => {
        socket.emit("receiveMessage", message);
        message.delivered = true;
        message.save();
      });
    }

    console.log(`${userId} is online.`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
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
