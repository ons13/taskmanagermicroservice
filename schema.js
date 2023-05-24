const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type User {
    id: String!
    name: String!
    email: String!
    password: String!
  }
  

  type Task {
    id: String!
    title: String!
    description: String!
  }

  type Notification {
    id: String!
    title: String!
    description: String!
  }

  type Query {
    task(id: String!): Task
    tasks: [Task]
    notification(id: String!): Notification
    notifications: [Notification]
    user(id: String!): User
    users: [User]
  }
  type Mutation {
    CreateTask(id: String!, title: String!, description:String!): Task
    CreateNotification(id: String!, title: String!, description:String!): Notification
    UpdateTask(id: String!, title: String!, description:String!): Task
    UpdateNotification(id: String!, title: String!, description:String!): Notification
    DeleteTask(id: String!): Task
    DeleteNotification(id: String!): Notification
    CreateUser(id: String!, name: String!, email:String!,password:String!): User
    UpdateUser(id: String!, name: String!, email:String!,password:String!): User
    DeleteUser(id: String!): User
    
    
  }
`;

module.exports = typeDefs