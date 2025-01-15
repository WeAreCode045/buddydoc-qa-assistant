import { useMobile } from "@/hooks/use-mobile";
import React from "react";

const Sidebar = () => {
  const isMobile = useMobile();

  return (
    <div className={`sidebar ${isMobile ? "mobile" : ""}`}>
      {/* Sidebar content goes here */}
    </div>
  );
};

export default Sidebar;
