const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const userProtoPath = 'user.proto';
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const db = new sqlite3.Database('./database.db'); 

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    password TEXT,
    email TEXT
  )
`);


const userService = {
  getUser: (call, callback) => {
    const { user_id } = call.request;
    
    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        const user = {
          id: row.id,
          name: row.name,
          password: row.password,
          email: row.email,
        };
        callback(null, { user });
      } else {
        callback(new Error('User not found'));
      }
    });
  },
  searchUsers: (call, callback) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        const users = rows.map((row) => ({
          id: row.id,
          name: row.name,
          password: row.password,
          email: row.email,
        }));
        callback(null, { users });
      }
    });
  },
  CreateUser: (call, callback) => {
    const { user_id, name, password, email } = call.request;
    db.run(
      'INSERT INTO users (id, name, password, email) VALUES (?, ?, ?)',
      [user_id, name, password, email],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const user = {
            id: user_id,
            name, 
            password, 
            email,
          };
          callback(null, { user });
        }
      }
    );
  },
};



const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50053;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`User microservice running on port ${port}`);
