import React from 'react';
import { Bell, User } from 'lucide-react'; // Icon library ашиглаж болно

const Header = ({ userName, date, notificationsCount }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-lg shadow-md">
      {/* Left: Greeting + Date */}
      <div>
        <h2 className="text-xl font-semibold">
          Өглөөний мэнд, {userName} <span className="wave">👋</span>
        </h2>
        <p className="text-sm text-gray-400">{date}</p>
      </div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer" />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {notificationsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
