const app = require("./app");
const cors = require("cors");
const http = require("http").createServer(app);
const Score =  require("./models/Score.model");
const axios = require("axios")
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const game = [];

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("create-room", (room) => {
    socket.join(room.roomName);

    // Add the room to the game array
    game.push({
      room: room.roomName,

      users: [{ id: socket.id, email: room.email, userName: room.userName }],
    });

    console.log("game", JSON.stringify(game));
  });

  socket.on("join-room", (room) => {
  
    socket.join(room.roomName);
    const gameUsers = game.find((r) => r.room === room.roomName).users;
    gameUsers.push({ id: socket.id,email: room.email, userName: room.name, score: 0 });

    // socket.to(room.roomName).emit("userJoined", gameUsers);
    io.to(room.roomName).emit("userJoined", gameUsers);
  });


  socket.on("endGame",async (room, callback) => {
    const roomUsers = game.find((r) => r.room === room.roomName).users;
    const scoreData = new Score({
      players: roomUsers.map(user => {
        if(user.score){
          return {
            playerName: user.userName,
            email: user.email,
            score: user.score,
            rank: user.rank,

          }
        }
      }),
      date: new Date(),
      roomName: room.roomName,
      creator: roomUsers[0].userName,
    });

    await scoreData.save();

   
    try {
      const response = await axios.post('/game/endgame', { scoreData });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error sending user data to the server:', error.message);
    }
    callback(roomUsers);
      io.to(room.roomName).emit("result", roomUsers);

     const roomIndex = game.findIndex((r) => r.room === room.roomName);
        if (roomIndex !== -1) {
          game.splice(roomIndex, 1);
        }

  });

  socket.on('getUsers',(room, callback) => {
   const roomData = game.find((r) => r.room === room.room)
   if(roomData){
    console.log('rromdata',roomData)
    callback(roomData.users)
   }
  })

  socket.on("sendQuestion", (room) => {
    io.to(room.roomName).emit("question", room.question);
  });
  socket.on("submitAnswer", (data) => {
    console.log(data)
    const gameUsers = game.find((r) => r.room === data.playerDetail.room).users;
      
    gameUsers.find((user) => user.userName === data.playerDetail.userName).score++;
     console.log(gameUsers);
  });

  socket.on("leave-room", (room) => {
    const roomData = game.find((r) => r.room === room.roomName);

    if (roomData) {
      const userIndex = roomData.users.findIndex(
        (user) => user.id === socket.id
      );
      if (userIndex !== -1) {
        roomData.users.splice(userIndex, 1);
        socket.leave(room.roomName);

        // Broadcast the updated scores to all users in the room
        io.to(room.roomName).emit("updateScores", roomData.users);

        console.log("leave", room);
      }
    } else {
      console.error("Room not found:", room.roomName);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Remove the user from all rooms in the game array
    game.forEach((roomData) => {
      const index = roomData.users.findIndex((user) => user.id === socket.id);
      if (index !== -1) {
        roomData.users.splice(index, 1);

        // Broadcast the updated scores to all users in the room
        io.to(roomData.room).emit("updateScores", roomData.users);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, function () {
  console.log(`Server listening on http://localhost:${PORT}`);
});
