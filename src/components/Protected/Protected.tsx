import React, { useEffect } from "react";
import Layout from "../Layout/Layout";
import { Text, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

interface ProtectedProps {
  title: string;
  info: string;
  forward: string
}

const Protected: React.FC<ProtectedProps> = ({ title, info, forward }) => {

  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.push(forward)
    }, 2000)
  }, [])
  return (
    <Layout>
      <VStack w="full" pt="3rem">
        <Heading>{title}</Heading>
        <Text>{info}</Text>
        <Text>You are going to be redirected to another page</Text>
      </VStack>
    </Layout>
  );
};

export default Protected;
