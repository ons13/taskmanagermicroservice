const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const taskProtoPath = 'task.proto';
const taskProtoDefinition = protoLoader.loadSync(taskProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).task;
const db = new sqlite3.Database('./database.db'); // Change ':memory:' to a file path to create a persistent database file

// Create a table for tasks
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);


const taskService = {
  getTask: (call, callback) => {
    const { task_id } = call.request;
    
    db.get('SELECT * FROM tasks WHERE id = ?', [task_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        const task = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        callback(null, { task });
      } else {
        callback(new Error('Task not found'));
      }
    });
  },
  searchTasks: (call, callback) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        const tasks = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        }));
        callback(null, { tasks });
      }
    });
  },
  CreateTask: (call, callback) => {
    const { task_id, title, description } = call.request;
    db.run(
      'INSERT INTO tasks (id, title, description) VALUES (?, ?, ?)',
      [task_id, title, description],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const task = {
            id: task_id,
            title,
            description,
          };
          callback(null, { task });
        }
      }
    );
  },
};



const server = new grpc.Server();
server.addService(taskProto.TaskService.service, taskService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Task microservice running on port ${port}`);