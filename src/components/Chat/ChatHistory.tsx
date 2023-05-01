import { Avatar, HStack, Text, VStack } from '@chakra-ui/react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { CSSProperties, useEffect, useRef, useState } from 'react';



interface ChatHistoryProps {
    chatRoom: any
    userId: any
    audio: any
    roomId: any
}

// const mimeType = "audio/webm";

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatRoom, userId, audio, roomId }) => {

    const supabase = useSupabaseClient()
    const [chatHistory, setChatHistory] = useState<any>([])
    const [userInfo, setUserInfo] = useState<any>([])
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    const audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/text-sound.m4a');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        getMessages()
        const chatmessages = supabase.channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chatmessages' },
                (payload) => {
                    console.log('Change received!', payload)
                    console.log("Event type", payload.eventType)

                    getMessages()
                    if (payload?.new && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id !== userId) {
                        audioElement.play();
                    }
                }
            )
            .subscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, audio])

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatHistory]);

    const getMessages = async () => {
        const { data, error } = await supabase
            .from('chatmessages')
            .select(`
          *
        `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })

        if (data) {
            setChatHistory(data)
            getUserInfo()
            return data
        }

        if (error) {
            console.log(error)
            return error
        }
    }

    const getUserInfo = async () => {
        chatRoom?.group_users_id?.map(async (user: string) => {
            const { data, error } = await supabase
                .from('profile')
                .select(`
          *
        `)
                .eq('user_id', user)

            if (data) {
                setUserInfo([...userInfo, data])
                return data
            }

            if (error) {
                console.log(error)
                return error
            }
        })

    }

    const base64toBlob = (base64Data: string) => {
        const newBase = base64Data.replace('data:audio/webm;codecs=opus;base64,', '');
        const binaryData = Buffer.from(newBase, 'base64').toString('binary');
        const byteNumbers = new Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            byteNumbers[i] = binaryData.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const audioBlob = new Blob([byteArray], { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        return url;
    };

    const audioStyle: CSSProperties = {
        height: '30px',
        borderRadius: "20rem"
    };

    return (
        <VStack ref={chatHistoryRef} border="1px solid" borderColor="gray.900" p="1rem" w="full" h="41.875rem" bgColor="gray.900" overflow="auto">
            {chatHistory?.length > 0 && chatHistory?.map((chat: any, index: number) => {

                return (
                    <VStack w="100%" key={chat?.id}>
                        {(chat?.user_id) !== (userId) ?

                            <VStack w="100%" align="flex-start">
                                <Text fontSize="xx-small">{chat?.user_id}</Text>
                                <HStack p="0.5rem" border="1px solid" borderColor="gray.900" rounded="xl" bgColor="black">
                                    <Avatar size="sm" />
                                    <HStack>
                                        {chat?.audio ? <audio src={base64toBlob(chat?.message)} controls style={audioStyle}></audio> : <Text fontSize="sm">{chat?.message}</Text>}
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
                                            {chat?.audio ? <audio src={base64toBlob(chat?.message)} controls style={audioStyle}></audio> : <Text fontSize="sm">{chat?.message}</Text>}
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