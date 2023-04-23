import React from "react";
import NavBar from "@/components/NavBar/NavBar";
import { Box } from "@chakra-ui/react";

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
