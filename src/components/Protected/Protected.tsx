import React from "react";
import Layout from "../Layout/Layout";
import { Center, Heading } from "@chakra-ui/react";

interface ProtectedProps {}

const Protected: React.FC<ProtectedProps> = ({}) => {
  return (
    <Layout>
      <Center>
        <Heading>Login to get access to this page</Heading>
      </Center>
    </Layout>
  );
};

export default Protected;
