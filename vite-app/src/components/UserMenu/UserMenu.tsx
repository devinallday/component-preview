import React, { useCallback } from "react";
import Dropdown from "../Dropdown/Dropdown";
import type { DropdownItem, UserMenuAction } from "../../types";
import { mockUser } from "../../data/mockData";

const UserMenu: React.FC = () => {
  const handleProfile = useCallback(() => {
    console.log("Navigate to profile");
  }, []);

  const handleSettings = useCallback(() => {
    console.log("Navigate to settings");
  }, []);

  const handleLogout = useCallback(() => {
    console.log("Logout user");
  }, []);

  const handleUpgrade = useCallback(() => {
    console.log("Navigate to upgrade");
  }, []);

  const handleMenuSelect = useCallback(
    (action: UserMenuAction) => {
      switch (action) {
        case "profile":
          handleProfile();
          break;
        case "settings":
          handleSettings();
          break;
        case "upgrade":
          handleUpgrade();
          break;
        case "logout":
          handleLogout();
          break;
      }
    },
    [handleProfile, handleSettings, handleUpgrade, handleLogout],
  );

  const menuItems: DropdownItem<UserMenuAction>[] = [
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      value: "profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      value: "settings",
    },
    {
      id: "separator1",
      label: "",
      value: "profile", // dummy value for separator
      separator: true,
    },
    {
      id: "upgrade",
      label: "Upgrade to Premium",
      icon: "✨",
      value: "upgrade",
    },
    {
      id: "separator2",
      label: "",
      value: "profile", // dummy value for separator
      separator: true,
    },
    {
      id: "logout",
      label: "Log out",
      icon: "🚪",
      value: "logout",
    },
  ];

  const trigger = (
    <div className="flex items-center gap-2 bg-black/70 rounded-full px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-white/10">
      <img
        src={mockUser.imageUrl}
        alt={mockUser.name}
        className="w-8 h-8 rounded-full object-cover"
      />
      <span className="text-white text-sm font-medium max-w-24 truncate">
        {mockUser.name}
      </span>
      <svg
        className="w-4 h-4 text-spotify-gray-300 transition-transform duration-200"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
      </svg>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      items={menuItems}
      onSelect={handleMenuSelect}
      align="right"
      className=""
    />
  );
};

export default UserMenu;
