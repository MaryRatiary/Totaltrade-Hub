db = db.getSiblingDB('tthdb');

// Création des collections
db.createCollection('users');
db.createCollection('articles');
db.createCollection('messages');
db.createCollection('friendRequests');

// Index pour améliorer les performances
db.users.createIndex({ "email": 1 }, { unique: true });
db.articles.createIndex({ "userId": 1 });
db.messages.createIndex({ "senderId": 1, "receiverId": 1 });
db.friendRequests.createIndex({ "senderId": 1, "receiverId": 1 }, { unique: true });