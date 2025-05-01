import React from 'react';

const UserSidebar = ({ users }) => {
  console.log("Users in UserSidebar:", users); // Debug log

  return (
    <div className="user-sidebar bg-white rounded-lg shadow p-4 border border-red-500">
      <h3 className="text-lg font-semibold mb-3">Suggestions d'utilisateurs</h3>
      {users.length > 0 ? (
        <ul className="space-y-3">
          {users.slice(0, 5).map((user) => ( // Limit to 5 users for compact display
            <li key={user.id} className="flex items-center space-x-3">
              <img
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Aucun utilisateur trouvé</p>
      )}
    </div>
  );
};

export default UserSidebar;
