const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());
let users = [];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client Connected`);

  socket.on("Login", (data) => {
    //join the users to one room(if given room id is same) 
    socket.join(data.room);
    socket.broadcast.emit("userjoin", (data.username));
    const existingUser = users.find((user) => user.username === data.username);
    if (existingUser) {
      const error = `${data.username} is already connected.`;
      socket.emit("userconnectmessage", error);
    } else {
      users.push({ username: data.username, socketId: socket.id });
      console.log("users", users);
      socket.emit("userconnectmessage", data);
      io.emit("userListUpdate", users.map((user) => user.username));
    }
  });
  socket.on("sendMessage", (data) => {
    console.log("sendMessage", data)
    socket.to(data.room).emit("receivemessage", data)
  })
  socket.on("disconnect", () => {
    const disconnectedUser = users.find((user) => user.socketId === socket.id)
    console.log("disconnectedUser", disconnectedUser)
    console.log("disconnectedUser.socketId", disconnectedUser.socketId)
    console.log("socket.id", socket.id)


    if (disconnectedUser) {
      console.log(`${disconnectedUser.username} disconnected`);
      io.emit('userdisconnect', disconnectedUser);

      users = users.filter((user) => user.socketId !== socket.id);
      console.log(users, "userssssssssssssssssssssssssssssss")
    }

  });

});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
