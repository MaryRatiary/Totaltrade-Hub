import React from 'react';
import { Link } from 'react-router-dom';

const UserList = ({ users }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <img
              src={user.profilePicture || '/default-avatar.png'}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserList;
