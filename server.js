const app = require("./app");
const cors = require('cors');
const http = require('http').createServer(app);
 const io = require('socket.io')(http)
// // Allow all origins for now (you can restrict it to your frontend's URL in production)
app.use(cors({origin: "http://localhost:5173"}));

// const io = require('socket.io')(http,{
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });



const game = [];
const rooms = new Map();

io.on("connection", (socket) => {
  // console.log("user connected");


  socket.on('create-room', (room) => {
    console.log('create', room);
    socket.join(room.roomName);

    // Add the room to the game array
    game.push({
      room: room.roomName,
      users: [room.name],
    });
  });

  socket.on('join-room', (room) => {
    const users = rooms.get(room.roomName) || new Set();
    users.add(socket.id);
    rooms.set(room.roomName, users);
    
    socket.join(room.roomName);
    socket.to(room.roomName).emit('userJoined', room.name);
   
    
    console.log('join', room);
  });

  socket.on('leave-room', (room) => {
    const roomData = game.find((r) => r.room === room.roomName);

    if (roomData) {
      roomData.users = roomData.users.filter((user) => user !== room.name);
      socket.leave(room.roomName);
      io.to(room.roomName).emit('userJoined', roomData.users);
      console.log('leave', room);
    } else {
      console.error('Room not found:', room.roomName);
    }
  })

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Remove the user from all rooms in the game array
    game.forEach((roomData) => {
      const index = roomData.users.indexOf(socket.id);
      if (index !== -1) {
        roomData.users.splice(index, 1);
      }
    });
  });
});




