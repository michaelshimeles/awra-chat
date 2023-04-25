import { VStack, Text } from '@chakra-ui/react';
import React from 'react'

interface ChatHistoryProps {

}

const ChatHistory: React.FC<ChatHistoryProps> = ({ }) => {
    return (
        <VStack>
            <Text>Messages will display here</Text>
        </VStack>
    );
}

export default ChatHistory;