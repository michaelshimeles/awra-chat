import { Avatar, HStack, Text, VStack } from '@chakra-ui/react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useRef, useState } from 'react';


interface ChatHistoryProps {
    roomId: any
    userId: any
    historyKey: any
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ roomId, userId }) => {

    console.log("RoomID", roomId)
    const [chatHistory, setChatHistory] = useState<any>([])

    const supabase = useSupabaseClient()

    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getMessages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const chatmessages = supabase.channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chatmessages' },
                (payload) => {
                    console.log('Change received!', payload)
                    console.log("Event type", payload.eventType)
                    getMessages()
                }
            )
            .subscribe()

    }, [roomId])

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const getMessages = async () => {
        const { data, error } = await supabase
            .from('chatmessages')
            .select()
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })

        if (data) {
            setChatHistory(data)
            return data
        }

        if (error) {
            console.log(error)
            return error
        }
    }

    const getUserInfo = async (id: any) => {

        let { data: profile, error } = await supabase
            .from('profile')
            .select('*')
            .eq("user_id", id)

        if (profile) return profile[0]?.username
    }



    return (
        <VStack ref={chatHistoryRef} border="1px solid" borderColor="gray.900" p="1rem" w="full" h="41.875rem" bgColor="gray.900" overflow="auto">
            {chatHistory.length > 0 && chatHistory.map((chat: any) => {
                return (
                    <VStack w="100%" key={chat?.id}>
                        {(chat?.user_id) !== (userId) ?
                            <VStack w="100%" align="flex-start">
                                <Text fontSize="xx-small">{chat?.user_id}</Text>
                                <HStack p="0.5rem" border="1px solid" borderColor="gray.900" rounded="xl" bgColor="black">
                                    <Avatar size="sm" />
                                    <HStack>
                                        <Text fontSize="sm">{chat?.message}</Text>
                                        <Text fontSize="xx-small">{new Date(chat?.created_at).toLocaleTimeString() + " " + new Date(chat?.created_at).toLocaleDateString()}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>
                            :
                            <VStack w="100%" align="flex-end">
                                <VStack align="flex-start">
                                    <Text fontSize="xx-small">{chat?.user_id}</Text>
                                    <HStack p="0.5rem" border="1px solid" borderColor="gray.900" rounded="xl" bgColor="black">
                                        <Avatar size="sm" />
                                        <HStack>
                                            <Text fontSize="sm">{chat?.message}</Text>
                                            <Text fontSize="xx-small">{new Date(chat?.created_at).toLocaleTimeString() + " " + new Date(chat?.created_at).toLocaleDateString()}</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </VStack>
                        }
                    </VStack>)
            })}
        </VStack >
    );
}

export default ChatHistory;