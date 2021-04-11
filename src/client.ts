const io = require('socket.io-client');
const readcommand = require('readcommand');
const socket = io('http://127.0.0.1:5050');

let playerTurnId = '';
let gameUsers: User[] = [];
let myUserId = '';
let playerNo = '';

let board: any = {
  1: ' ',
  2: ' ',
  3: ' ',
  4: ' ',
  5: ' ',
  6: ' ',
  7: ' ',
  8: ' ',
  9: ' ',
};

const winCombinations = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7],
];

const printBoard = () => {
  console.log(
    '\n' +
      ' ' +
      board[1] +
      ' | ' +
      board[2] +
      ' | ' +
      board[3] +
      '\n' +
      ' ---------\n' +
      ' ' +
      board[4] +
      ' | ' +
      board[5] +
      ' | ' +
      board[6] +
      '\n' +
      ' ---------\n' +
      ' ' +
      board[7] +
      ' | ' +
      board[8] +
      ' | ' +
      board[9] +
      '\n'
  );
};

const printData = (number: number, sign: string) => {
  if (sign === gameUsers[1].id) {
    board[number] = 'X'.toUpperCase();
  } else {
    board[number] = '0'.toUpperCase();
  }
  printBoard();
};

const checkWin = (player: string) => {
  let i, j, markCount;
  for (i = 0; i < winCombinations.length; i++) {
    markCount = 0;
    for (j = 0; j < winCombinations[i].length; j++) {
      if (board[winCombinations[i][j]] === player) {
        markCount++;
      }
      if (markCount === 3) {
        return true;
      }
    }
  }
  return false;
};

const checkTie = () => {
  for (let i = 1; i <= Object.keys(board).length; i++) {
    if (board[i] === ' ') {
      return false;
    }
  }
  return true;
};

const markBoard = (position: number, playerNo: string) => {
  if (playerNo === 'first') {
    playerNo = 'second';
    playerTurnId = gameUsers[1].id;
  } else {
    playerNo = 'first';
    playerTurnId = gameUsers[0].id;
  }
  socket.emit('saveData', {quadratNumber: position, user: playerTurnId});
  socket.emit('turn', playerTurnId);
};

socket.on('allUsers', (allUsers: User[]) => {
  if (allUsers.length === 2) {
    gameUsers = allUsers;
    playerTurnId = allUsers[0].id;
    myUserId = socket.id;
    console.log(
      'Game started: \n' +
        ' 1 | 2 | 3 \n' +
        ' --------- \n' +
        ' 4 | 5 | 6 \n' +
        ' --------- \n' +
        ' 7 | 8 | 9 \n'
    );
    if (playerTurnId === myUserId) {
      console.log('You are First Player.');
      playerNo = 'first';
      socket.emit('turn', 'first time');
    } else {
      playerNo = 'second';
      console.log('You are Second Player.');
    }
    playTurn();
  } else {
    console.log('Waiting for other player!');
  }
});

socket.on('turn', (isTurn: string) => {
  if (isTurn === 'first time') {
    console.log('Now it is first player turn.');
  } else {
    playerTurnId = isTurn;
    let winChecking = false;
    if (playerTurnId === gameUsers[0].id) {
      winChecking = checkWin('0');
      if (winChecking) {
        console.log('Second Player Won!');
        process.exit(1);
      } else {
        if (checkTie()) {
          console.log('This game is tie!');
          process.exit(1);
        } else {
          console.log('Now it is first player turn.');
        }
      }
    } else {
      winChecking = checkWin('X');
      if (winChecking) {
        console.log('First Player Won!');
        process.exit(1);
      } else {
        if (checkTie()) {
          console.log('This game is tie!');
          process.exit(1);
        } else {
          console.log('Now it is second player turn.');
        }
      }
    }
  }
});

socket.on('printData', (data: any) => {
  printData(data.quadratNumber, data.user);
});

socket.on('logOut', (userId: string) => {
  if (myUserId !== userId) {
    console.log('Another user is out.You won the game!');
    board = {
      1: ' ',
      2: ' ',
      3: ' ',
      4: ' ',
      5: ' ',
      6: ' ',
      7: ' ',
      8: ' ',
      9: ' ',
    };
    process.exit(1);
  }
});

const isInt = (value: any) => {
  if (isNaN(value)) {
    return false;
  }
  const x = parseFloat(value);
  return (x | 0) === x;
};

const validateMove = (position: string): boolean => {
  return isInt(position) && board[position] === ' ';
};

const playTurn = () => {
  readcommand.loop(function (err: any, args: any, str: any, next: any) {
    if (err && err.code === 'SIGINT') {
      process.exit(1);
    } else {
      const position = args.toString();
      if (position === 'r') {
        console.log('You lose the game for resigning!');
        socket.disconnect();
        process.exit(1);
      } else {
        if (playerTurnId === myUserId) {
          if (validateMove(position)) {
            markBoard(position, playerNo);
          } else {
            console.log('incorrect input please try again...');
          }
        } else {
          console.log('Enter r to resign ...');
        }
      }
      return next();
    }
  });
};
