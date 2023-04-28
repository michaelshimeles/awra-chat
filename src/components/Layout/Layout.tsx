import React from "react";
import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
const NavBar = dynamic(() => import("@/components/NavBar/NavBar"));

interface LayoutProps {
  children: any;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bgColor="black">
      <NavBar />
      {children}
    </Box>
  );
};

export default Layout;
