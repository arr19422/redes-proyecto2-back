const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000
const { addUser, removeUser, getCards, getUsersInRoom, sendCards, challenge } = require("./Game/Game")

//New imports
const http = require("http").Server(app)
const cors = require("cors")

app.use(coeers())

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    origin: "http://localhost:4000",
    origin: "https://redes-proyecto2.herokuapp.com/",
  },
})

socketIO.on("connection", (socket) => {
  console.log("socket is ready for connection")

  socket.on("joinRoom", ({ ...roomObject }) => {
    const username = addUser({
      id: socket.id,
      username: roomObject.username,
      room: roomObject.room,
    })

    socket.join(roomObject.room)

    if (username?.error) {
      socket.emit("error", username.error)
      return
    }

    socket.emit("message", "Welcome to application " + username)

    socket.broadcast
      .to(roomObject.room)
      .emit("message", `${roomObject.username} has joined to the room`)

    socketIO.to(roomObject.room).emit("roomUsers", {
      room: roomObject.room,
      users: getUsersInRoom(roomObject.room),
    })

  })

  socket.on('roomUsers', ({ ...roomObject }) => {
    socket.join(roomObject.room)
    socketIO.to(roomObject.room).emit("roomUsers", {
      room: roomObject.room,
      users: getUsersInRoom(roomObject.room),
    })
  })

  socket.on("getCards", ({ ...data }) => {
    const cards = getCards(data.room)
    cards.forEach((data) => {
      socketIO.to(data.id).emit("getCards", {
        type: "game",
        sender: "server",
        action: "getCards",
        cards: data.cards
      })
    })
  })

  socket.on("sendCards", ({ ...data }) => {
    const res = sendCards(data.username, data.room, data.card, data.truth)
    socketIO.to(res.id).emit("sendCards", {
      type: "game",
      sender: "server",
      action: "sendCards",
      cards: res.cards
    })
  })

  socket.on("challenge", ({ ...data }) => {
    const res = challenge(data.username, data.room, data.challended)
    if (!res.bool){
      socketIO.to(res.dataU.id).emit("challenge", {
        type: "game",
        sender: "server",
        action: "challenge",
        cards: res.dataU.cards,
        message: "It was truth, you pick all the cards in pool"
      })
      socketIO.to(res.dataC.id).emit("challenge", {
        type: "game",
        sender: "server",
        action: "challenge",
        cards: res.dataC.cards,
        message: "He picks all the cards in pool, you are safe"
      })
    } else {
      socketIO.to(res.dataU.id).emit("challenge", {
        type: "game",
        sender: "server",
        action: "challenge",
        cards: res.dataU.cards,
        message: "you discovered the liar, he picks all the cards in pool"
      })
      socketIO.to(res.dataC.id).emit("challenge", {
        type: "game",
        sender: "server",
        action: "challenge",
        cards: res.dataC.cards,
        message: "you got caught! you pick all the cards in pool"
      })
    }
  })

  socket.on("chat", ({ ...data }) => {
    socket.join(data.room)
    socketIO.to(data.room).emit("messages", {
      type: "chat",
      username: data.username,
      messages: data.text,
      date: data.date
    })
  })

  socket.on("changeTurn", ({ ...data }) => {
    socketIO.to(res.id).emit("changeTurn", {
      type: "game",
      sender: "server",
      action: "changeTurn",
      message: `Is ${data.username} Turn!`
    })
  })

  socket.on("disconnecting", () => {
    console.log(socket.rooms) // the Set contains at least the socket ID
  })

  socket.on("disconnect", ({ ...roomObject }) => {
    removeUser(roomObject.id)
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
