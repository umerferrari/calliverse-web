module.exports = (io, socket) => {
    // User joins a chat
    socket.on("joinChat", ({ chatId, chatType }) => {
      if (chatType === "one-to-one") {
        socket.join(`oneToOneChat:${chatId}`);
        console.log(`${socket} joins ${chatId} group`)
      } else if (chatType === "group") {
        socket.join(`groupChat:${chatId}`);
      }
    });
  };
  