import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Player from "../Player/Player";
import type { Track } from "../../types";

interface LayoutProps {
  children: React.ReactNode;
  onTrackSelect: (track: Track) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onTrackSelect }) => {
  return (
    <div className="h-[calc(100vh-90px)] flex flex-col flex-1">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onTrackSelect={onTrackSelect} />
        <main className="flex-1 bg-gradient-to-b from-blue-900/50 to-spotify-gray-900 p-6 overflow-y-auto rounded-lg mr-2 relative">
          {children}
        </main>
      </div>
      <Player />
    </div>
  );
};

export default Layout;
