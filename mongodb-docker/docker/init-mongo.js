db.auth('root', 'example')

db = db.getSiblingDB('tthdb');

db.createUser({
    user: "root",
    pwd: "example",
    roles: [
        {
            role: "readWrite",
            db: "tthdb"
        }
    ]
});

// Create collections
db.createCollection('users');
db.createCollection('articles');
db.createCollection('messages');
db.createCollection('friendRequests');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.articles.createIndex({ "userId": 1 });
db.messages.createIndex({ "senderId": 1 });
db.messages.createIndex({ "receiverId": 1 });
db.friendRequests.createIndex({ "senderId": 1, "receiverId": 1 }, { unique: true });
