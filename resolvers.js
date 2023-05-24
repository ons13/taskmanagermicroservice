
const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const taskProtoPath = 'task.proto';
const notificationProtoPath = 'notification.proto';
const userProtoPath = 'user.proto';
const taskProtoDefinition = protoLoader.loadSync(taskProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProtoDefinition = protoLoader.loadSync(notificationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults:true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).task;
const notificationProto = grpc.loadPackageDefinition(notificationProtoDefinition).notification;
const clientTasks = new taskProto.TaskService('localhost:50051', grpc.credentials.createInsecure());
const clientNotifications = new notificationProto.NotificationService('localhost:50052', grpc.credentials.createInsecure());
const clientUsers = new userProto.UserService('localhost:50053', grpc.credentials.createInsecure());
const db = new sqlite3.Database('./database.db');

// Create a table for tasks
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for notifications
db.run(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT
  )
`);


const resolvers = {
  Query: {
    user: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    users: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },




    task: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    tasks: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tasks', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    notification: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM notifications WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    notifications:() => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM notifications', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    
  },
  Mutation: {
    CreateUser: (_, { id, name, email, password }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
          [id, name, email, password],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, name, email, password });
            }
          }
        );
      });
    },

    UpdateUser: (_, { id, name, email, password }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
          [name, email, password, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, name, email, password });


            }
          }
        );
      });
    },
    DeleteUser: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },

    CreateTask: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO tasks (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    CreateNotification: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO notifications (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    UpdateTask: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    
    },
    UpdateNotification: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE notifications SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      }
    );
    },
    DeleteTask: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      
      });
    },
    DeleteNotification: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM notifications WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      
      });
    },
    


  }
  

};


module.exports = resolvers;
