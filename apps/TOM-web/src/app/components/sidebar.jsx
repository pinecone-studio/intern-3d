'use client';

import { useState } from 'react';

const menu = [
  { label: 'Dashboard' },
  { label: 'Tasks', badge: 5 },
  { label: 'Users' },
  { label: 'Calendar' },
  { label: 'Messages', badge: 2 },
  { label: 'Documents' },
  { label: 'Completed Tasks' },
];

const Sidebar = () => {
  const [active, setActive] = useState('Dashboard');

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <div className="text-xl font-bold mb-6">WorkSpace</div>
      <div className="flex-1">
        {menu.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-3 mb-2 rounded cursor-pointer ${
              active === item.label ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setActive(item.label)}
          >
            <div className="flex items-center gap-2">
              {/* Icon байхгүй учраас зөвхөн label харуулж байна */}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
