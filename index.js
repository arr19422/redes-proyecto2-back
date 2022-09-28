const express = require("express")
const app = express()
const PORT = 3000
const { addUser, removeUser, getUser, getUsersInRoom } = require("./Game/Game")

//New imports
const http = require("http").Server(app)
const cors = require("cors")

app.use(cors())

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
})

socketIO.on("connection", (socket) => {
  console.log("socket is ready for connection")

  socket.on("joinRoom", ({ ...roomObject }) => {
    const username = addUser({
      id: socket.id,
      username: roomObject.user,
      room: roomObject.room,
    })

    socket.join(roomObject.room)

    socket.emit("message", "Welcome to application " + username)

    socket.broadcast
      .to(roomObject.room)
      .emit("message", `${roomObject.user} has joined to the room`)

    socketIO.to(roomObject.room).emit("roomUsers", {
      room: roomObject.room,
      users: getUsersInRoom(roomObject.room),
    })

    socketIO.to(roomObject.room).emit("roomSettings", {
      ...roomObject,
    })
  })

  socket.on("startGame", ({ ...data }) => {})

  socket.on("disconnecting", () => {
    console.log(socket.rooms) // the Set contains at least the socket ID
  })

  socket.on("disconnect", ({ ...roomObject }) => {
    socket.broadcast
      .to(roomObject.room)
      .emit("message", `${roomObject.user} left the room`)
  })
})

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  })
})

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
