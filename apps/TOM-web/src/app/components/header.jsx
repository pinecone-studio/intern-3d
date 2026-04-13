import React from 'react';
import { Bell } from 'lucide-react';

const Header = ({ userName, date, notificationsCount }) => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4 text-white shadow-md">
      <div>
        <h2 className="text-xl font-semibold">Өдрийн мэнд, {userName}</h2>
        <p className="text-sm text-gray-400">{date}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-6 w-6 cursor-pointer text-gray-300 hover:text-white" />
          {notificationsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notificationsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
