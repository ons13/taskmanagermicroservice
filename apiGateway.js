const sqlite3 = require('sqlite3').verbose();
const express = require('express');

//loads the `ApolloServer` module(QRAFQL server)
const { ApolloServer } = require('@apollo/server');

// loads the `expressMiddleware` module
const { expressMiddleware } = require ('@apollo/server/express4');

// loads the `body-parser` module.
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const userProtoPath = 'user.proto';
const taskProtoPath = 'task.proto';
const notificationProtoPath = 'notification.proto';

const resolvers = require('./resolvers');
//loads the `schema` file
const typeDefs = require('./schema');

// creates a new database connection.
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


const app = express();
app.use(bodyParser.json());

const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true, 
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });


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
  
  const userProto=grpc.loadPackageDefinition(userProtoDefinition).user;
  const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).task;
  const notificationProto = grpc.loadPackageDefinition(notificationProtoDefinition).notification;
  const clientTasks = new taskProto.TaskService('localhost:50051', grpc.credentials.createInsecure());
  const clientNotifications = new notificationProto.NotificationService('localhost:50052', grpc.credentials.createInsecure());
  const clientUser=new userProto.UserService('localhost:50053', grpc.credentials.createInsecure());
  


const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
      );
  });


  app.get('/user',(req,res)=>{
    db.all('SELECT * FROM users',(err,rows)=>{
      if(err){
        res.status(500).send(err);
      }else{
        res.json(rows);
      
      }
    })
  })

  app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('User not found.');
      }
    });
  });
  app.post('/createuser', (req, res) => {
    const { id, name, email,password } = req.body;
    db.run(
      'INSERT INTO users (id, name, email,password) VALUES (?, ?, ?,?)',
      [id, name, email,password],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, name, email,password });
        }
      }
    );
  });
  app.delete('/deleteuser', (req, res) => {
    const { id, name, email,password } = req.body;
    db.run(
      'DELETE FROM tasks WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, name, email,password });
        }
      }
    );
  });



  app.get('/task', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  });
  
  
  app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('Task not found.');
      }
    });
  });
  
  app.get('/notifications/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM notifications WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).send(err);
      } else if (row) {
        res.json(row);
      } else {
        res.status(404).send('Notification not found.');
      }
    });
  });

  app.get('/notifications', (req, res) => {
    db.all('SELECT * FROM notifications', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  }
  );

  app.post('/task', (req, res) => {
    const { id, title, description } = req.body;
    db.run(
      'INSERT INTO tasks (id, title, description) VALUES (?, ?, ?)',
      [id, title, description],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, title, description });
        }
      }
    );
  });

  app.post('/notifications', (req, res) => {
    const { id, title, description } = req.body;
    db.run(
      'INSERT INTO notifications (id, title, description) VALUES (?, ?, ?)',
      [id, title, description],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id, title, description });
        }
      }
    );
  });

  app.put('/task/:id', (req, res) => {
    const { title, description } = req.body;
    const taskId = req.params.id;
    db.run(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
      [title, description, taskId],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id: taskId, title, description });
        }
      }
    );
  });
  
  app.put('/notification/:id', (req, res) => {
    const { title, description } = req.body;
    const notificationId = req.params.id;

    db.run(
      'UPDATE notifications SET title = ?, description = ? WHERE id = ?',
      [title, description, notificationId],
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({ id: notificationId, title, description });
        }
      }
    );
  });
  
  app.delete('/deletetask/:id', (req, res) => {
    const taskId = req.params.id;
    db.run(
      'DELETE FROM tasks WHERE id = ?',
      taskId,
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.sendStatus(204);
        }
      }
    );
  });
  
  
  app.delete('/deletenotification/:id', (req, res) => {
    const notificationId = req.params.id;
    db.run(
      'DELETE FROM notifications WHERE id = ?',
      notificationId,
      function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.sendStatus(204);
        }
      }
    );
  });
  

  app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(rows);
      }
    });
  }
  );

  



const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
