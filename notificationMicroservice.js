const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const db = new sqlite3.Database('./database.db'); 

const notificationProtoPath = 'notification.proto';
const notificationProtoDefinition = protoLoader.loadSync(notificationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(notificationProtoDefinition).notification;

const notificationService = {
  getNotification: (call, callback) => {
    
    const notif = {
      id: call.request.notification_id,
      title: 'notification ex',
      description: 'This is an example notification.',
     
    };
    callback(null, {notif});
  },

}
const server = new grpc.Server();
server.addService(notificationProto.NotificationService.service, notificationService);
const port = 50052;

// Create a table for notifications
db.run(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Insert a sample notification into the table
// db.run(`
//   INSERT INTO notifications (id, title, description)
//   VALUES (1, 'notification ex', 'This is an example notification.')
// `);

server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Notification microservice running on port ${port}`);
