// Switch to admin database
db = db.getSiblingDB('admin');

// Create root user first
db.createUser({
    user: "root",
    pwd: "example",
    roles: [
        { role: "userAdminAnyDatabase", db: "admin" },
        { role: "readWriteAnyDatabase", db: "admin" }
    ]
});

// Authenticate as root
db.auth("root", "example");

// Switch to the application database
db = db.getSiblingDB('tthdb');

// Create application user
db.createUser({
    user: "tthapp",
    pwd: "tthapppass",
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
