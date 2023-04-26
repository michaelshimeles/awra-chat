import { VStack, Text, HStack, Avatar, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface ChatHistoryProps {
    roomId: any
    userId: any
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ roomId, userId }) => {

    const [chatHistory, setChatHistory] = useState<any>([])

    const supabase = useSupabaseClient()

    supabase.channel('message-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'chatmessages' },
            (payload) => {
                console.log('Change received!', payload)
                getMessages()
            }
        )
        .subscribe()

    useEffect(() => {
        getMessages()
    }, [])

    const getMessages = async () => {
        const { data, error } = await supabase
            .from('chatmessages')
            .select()
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })

        console.log('chats:', data) // Debugging statement

        if (data) {
            console.log(data)
            setChatHistory(data)
            return data
        }

        if (error) {
            console.log(error)
            return error
        }
    }


    return (
        <VStack border="1px solid" borderColor="gray.900" p="1rem" w="full" h="41.875rem">
            {chatHistory.length > 0 && chatHistory.map((chat: any) => {
                return (
                    <VStack w="100%" key={chat?.id}>
                        {(chat?.user_id) !== (userId) ?
                            <VStack w="100%" align="flex-start">
                                <HStack p="0.5rem" border="1px solid" borderColor="gray.900" rounded="xl">
                                    <Avatar size="sm" />
                                    <HStack>
                                        <Text fontSize="sm">{chat?.message}</Text>
                                        <Text fontSize="xx-small">{new Date(chat?.created_at).toLocaleTimeString() + " " + new Date(chat?.created_at).toLocaleDateString()}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                            :
                            <VStack w="100%" align="flex-end">
                                <HStack p="0.5rem" border="1px solid" borderColor="gray.900" rounded="xl">
                                    <Avatar size="sm" />
                                    <HStack>
                                        <Text fontSize="sm">{chat?.message}</Text>
                                        <Text fontSize="xx-small">{new Date(chat?.created_at).toLocaleTimeString() + " " + new Date(chat?.created_at).toLocaleDateString()}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                        }
                    </VStack>)
            })}
        </VStack >
    );
}

export default ChatHistory;