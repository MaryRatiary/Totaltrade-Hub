import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.token) {
          console.error("User not authenticated");
          return;
        }

        const response = await axios.get("http://localhost:5131/api/Users/list", { // Updated route
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSendMessage = () => {
    if (!selectedUser || !message) return;

    axios.post("http://localhost:5131/api/User/send-message", {
      senderId: "currentUserId", // Replace with the logged-in user's ID
      receiverId: selectedUser.id,
      content: message,
    })
      .then(() => {
        alert("Message sent successfully!");
        setIsMessageDialogOpen(false);
        setMessage("");
      })
      .catch(error => console.error("Error sending message:", error));
  };

  const handleSendFriendRequest = (userId) => {
    axios.post("http://localhost:5131/api/User/send-friend-request", {
      senderId: "currentUserId", // Replace with the logged-in user's ID
      receiverId: userId,
    })
      .then(() => alert("Friend request sent successfully!"))
      .catch(error => console.error("Error sending friend request:", error));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Users</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {users.map(user => (
          <Card key={user.Id} style={{ padding: "20px", textAlign: "center" }}>
            <img
              src={user.profilePicture || "/default-avatar.png"} // Ensure fallback to default avatar
              alt={`${user.FirstName} ${user.LastName}`}
              style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "10px" }}
            />
            <h3>{user.FirstName} {user.LastName}</h3>
            <p>{user.Email}</p>
            <div style={{ marginTop: "10px" }}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: "10px" }}
                onClick={() => {
                  setSelectedUser(user);
                  setIsMessageDialogOpen(true);
                }}
              >
                Send Message
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSendFriendRequest(user.Id)}
              >
                Add Friend
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onClose={() => setIsMessageDialogOpen(false)}>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMessageDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSendMessage} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersPage;
