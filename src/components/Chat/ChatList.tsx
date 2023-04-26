import { Avatar, Center, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface ChatListProps {
    roomId: string
}

const ChatList: React.FC<ChatListProps> = ({ roomId }) => {

    const [chatHistory, setChatHistory] = useState<any>(null)
    const supabase = useSupabaseClient()

    useEffect(() => {
        getChatInfo()
        getUserInfo()
    }, [])

    const getChatInfo = async () => {

        const { data: chatInfo, error } = await supabase
            .from('messages')
            .select("group_users_id")
            .eq('room_id', roomId)

        if (chatInfo) {
            setChatHistory(chatInfo)
            return
        }

        if (error) {
            console.log(error)
            return
        }
    }

    const getUserInfo = async () => {

    }

    return (
        <VStack border="1px solid" borderColor="gray.900" p="1rem" _hover={{ borderColor: "gray.700" }}>
            <HStack>
                {chatHistory?.map((chat: any, index: any) => {
                    {
                        return (
                            <VStack key={index}>
                                <HStack w="full" justify="flex-start" gap="1rem">
                                    {chat?.group_users_id?.map((info: any) => {
                                        return <Heading fontSize="sm">{info.substr(0, 8)}</Heading>
                                    })}
                                    {/* <Text>michaelshimeles</Text> */}
                                </HStack>
                                <Text>{`Reminder, the space starts in about 30 mins`.substr(0, 30) + "..."}</Text>
                            </VStack>
                        )
                    }
                })}
            </HStack>
        </VStack >
    );
}

export default ChatList;