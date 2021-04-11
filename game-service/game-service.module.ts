const _ = require('underscore')._;

const addUser = (id: any, sign: string): User => {
  return {id: id, sign: sign};
};

const changeUserTurn = (turn: string) => {
  return turn;
};

const deleteUser = (socket: any, users: User[]) => {
  let index = 0;
  _.each(users, (user: User) => {
    if (user.id === socket.id) {
      index = users.indexOf(user);
    }
  });
  users.splice(index, 1);
};

module.exports = {
  addUser,
  changeUserTurn,
  deleteUser,
};
