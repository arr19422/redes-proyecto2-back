const users = []
const roomCards = []
const usersCards = []
const usedCards = []
const isTruth = []

const addUser = ({ id, username, room }) => {
  const existingRoom = roomCards.find((name) => name.room === room)

  if (!existingRoom) {
    let cards = []
    for (let i = 1; i < 53; i++) {
      cards.push(i)
    }

    cards = cards.sort((a, b) => 0.5 - Math.random())

    const roomAdded = { cards, room }

    roomCards.push(roomAdded)
  }

  const existingUser = users.find((name) => {
    name.room === room && name.username === username
  })

  if (existingUser) {
    return { error: "Username is taken" }
  }
  const userAdded = { id, username, room }

  users.push(userAdded)
  return username
}

const removeUser = (username) => {
  const index = users.findIndex((user) => {
    user.username === username
  })

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getCards = (room) => {
  const roomUsers = getUsersInRoom(room)
  const actualRoomCards = getCardsRoom(room)

  roomUsers.forEach((user) => {
    const cardsArray = []

    for (let i = 1; i < 11; i++) {
      const pos = Math.floor(Math.random() * actualRoomCards[0].cards.length)
      cardsArray.push(actualRoomCards[0].cards[pos])
      actualRoomCards[0].cards.splice(pos, 1)
    }

    usersCards.push({
      id: user.id,
      username: user.username,
      room: user.room,
      cards: cardsArray,
    })
  })
  return usersCards
}

const sendCards = (user, room, pos, truth) => {
  const actualUser = getUser(user, room)
  const actualUsed = getUsed(room)
  if (!actualUsed){
    usedCards.push({
      cards: [actualUser.cards[pos]],
      room: room,
    })
  } else {
    const toPush = actualUsed.cards
    toPush.push(actualUser.cards[pos])
    usedCards.push({
      cards: toPush,
      room: room,
    })
  }



  isTruth.push({
    bool: truth,
    room: room,
  })

  usersCards[updateUser(user, room)].cards.splice(pos, 1)

  return usersCards[updateUser(user, room)]
}

const challenge = (username, room, challended) => {
  const actualTruth = getTruth(room)
  const actualUsed = getUsed(room)
  if (actualTruth.bool) {
    for (let i = 0; i < actualUsed.cards.length; i++) {
      const element = actualUsed.cards[i]
      usersCards[updateUser(username, room)].cards.push(element)
    }
    usedCards = []
    return { dataU: usersCards[updateUser(username, room)], dataC: usersCards[updateUser(challended, room)], bool: false }
  }
  for (let i = 0; i < actualUsed.cards.length; i++) {
    const element = actualUsed.cards[i]
    usersCards[updateUser(challended, room)].cards.push(element)
  }
  usedCards = []
  return { dataU: usersCards[updateUser(username, room)], dataC: usersCards[updateUser(challended, room)],  bool: true }
}

const getUser = (username, room) =>
  usersCards.find((user) => user.username === username && user.room === room)

const getTruth = (room) => isTruth.find((user) => user.room === room)

const getUsed = (room) => usedCards.find((user) => user.room === room)

const updateUser = (username, room) =>
  usersCards.findIndex(
    (user) => user.username === username && user.room === room
  )

const getUsersInRoom = (room) => users.filter((name) => name.room === room)

const getCardsRoom = (room) => roomCards.filter((name) => name.room === room)

module.exports = {
  addUser,
  removeUser,
  getUsersInRoom,
  getCards,
  sendCards,
  challenge,
}
