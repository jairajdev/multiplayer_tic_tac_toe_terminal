const app = require('express')();
const http = require('http').Server(app);
const socketIO = require('socket.io')(http);
const gameService = require('../game-service/game-service.module');

interface User {
  id: string;
  sign: string;
}

const MAX_USERS_NUMBER = 2;

const users: User[] = [];

const createPlayers = (id: string) => {
  return users.push(gameService.addUser(id, users.length));
};

socketIO.on('connection', (socket: any) => {
  console.log('A user connected with id ' + socket.id);
  if (MAX_USERS_NUMBER > users.length) {
    createPlayers(socket.id);
    socketIO.emit('allUsers', users);
  } else {
    socket.disconnect();
  }

  socket.on('saveData', (data: any) => {
    socketIO.emit('printData', data);
  });

  socket.on('turn', (turn: string) => {
    socketIO.emit('turn', turn);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected with id ' + socket.id);
    gameService.deleteUser(socket, users);
    socketIO.emit('logOut', socket.id);
  });
});

http.listen(5050, () => {
  console.log('listening on 5050');
});
