import React from 'react'
import Layout from '../Layout/Layout';
import { HStack, Heading, VStack } from '@chakra-ui/react';

interface FriendsProps {

}

const Friends: React.FC<FriendsProps> = ({ }) => {
    const getFriends = async () => {
        
    }
    return (
        <Layout >
            <HStack w="100%" gap="5rem" border="1px solid" rounded="none" borderColor="gray.900" p="1rem">
                <VStack>
                    <Heading fontSize="sm">Friends List</Heading>
                </VStack>
                <VStack>
                    <Heading fontSize="sm">Friends Request</Heading>
                </VStack>
                <VStack>
                    <Heading fontSize="sm">Search</Heading>
                </VStack>
            </HStack>
        </Layout>
    );
}

export default Friends;