const app = require("./app");
const cors = require("cors");
const http = require("http").createServer(app);
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
      users: [{ id: socket.id, userName: room.userName }],
    });

    console.log("game", JSON.stringify(game));
  });

  socket.on("join-room", (room) => {

    socket.join(room.roomName);
    const gameUsers = game.find((r) => r.room === room.roomName).users;
    gameUsers.push({ id: socket.id, userName: room.name, score: 0 });

    io.to(room.roomName).emit("userJoined", gameUsers);
  });


  socket.on("endGame", (room) => {

    const roomData = game.find((r) => r.room === room.roomData).users;

      io.to(room.roomData).emit("result", roomData);
   
  });


// socket.on("endGame", (data) => {
//   // Assuming gameResults is an array containing scores or other relevant data
//   const gameResults = getGameResults(data.roomData);
//   io.to(data.roomData).emit("result", gameResults);
// });

// // Additional function to calculate game results
// function getGameResults(roomData) {
//   // Implement your logic to calculate and return game results
//   // For example, you might loop through roomData to extract scores
//   const results = roomData.map((user) => ({
//     userName: user.userName,
//     score: user.score,
//   }));
//   return results;
// }



  socket.on("sendQuestion", (room) => {
    socket.to(room.roomName).emit("question", room.question);
  });
  socket.on("submitAnswer", (data) => {
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
