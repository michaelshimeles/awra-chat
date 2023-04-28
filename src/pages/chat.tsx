import ChatHistory from '@/components/Chat/ChatHistory';
import Protected from '@/components/Protected/Protected';
import { useGetMessageRoom } from '@/hooks/useGetMessageRoom';
import { Box, Button, Center, HStack, Heading, Show, Spinner, Textarea, VStack } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const Layout = dynamic(() => import('@/components/Layout/Layout'))
const ChatList = dynamic(() => import('@/components/Chat/ChatList'))

interface ChatProps {
    user: any,
    data: any
    children: any;
}


export const Chat: React.FC<ChatProps> = ({ data, children }) => {
    const { data: getMessageRooms, isLoading } = useGetMessageRoom(data?.[0]?.user_id);
    const [selectedChat, setSelectedChat] = useState<any>(null)

    const supabase = useSupabaseClient()

    const handleChatSelection = (chats: any) => {
        setSelectedChat(chats)
    }
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    const onSubmit = (formData: any) => {
        submitMessage(data?.[0]?.user_id, formData?.chatMessage).then((result) => {
            console.log("result", result)
            reset()
            // refreshHistory();
        })
    }

    const submitMessage = async (userId: any, message: any) => {
        const { data: sendingMessageData, error } = await supabase
            .from('chatmessages')
            .insert({
                room_id: selectedChat,
                user_id: userId,
                message: message
            });

        if (error) {
            console.log(error)
            return error
        }

        if (sendingMessageData) {
            console.log("sendingMessageData", data)
            return
        }
    }

    if (!data)
        return (
            <Protected title="Protected Route" info="This is a protected route" forward='/' />
        );

    return (
        <Layout>
            <VStack w="100%">
                <HStack align="flex-start" justify="flex-start" pt="5rem" w="80%">
                    <Show above='md'>
                        <VStack w="20%">
                            {!isLoading ? getMessageRooms?.map((chats: any, index: number) => {
                                if (chats === undefined) return
                                return (
                                    <Box key={index} onClick={() => handleChatSelection(chats)}>
                                        <ChatList roomId={chats} data={data} />
                                    </Box>
                                )
                            }) : <VStack>
                                <Spinner />
                            </VStack>}
                        </VStack>
                    </Show>
                    <Show below='md'>
                        <VStack w="10%">
                            {getMessageRooms?.map((chats: any, index: number) => {
                                if (chats === undefined) return
                                return (
                                    <Box key={index} onClick={() => handleChatSelection(chats)}>
                                        <ChatList roomId={chats} data={data} />
                                    </Box>
                                )
                            })}
                        </VStack>
                    </Show>
                    {selectedChat ? <VStack w="80%">
                        <ChatHistory roomId={selectedChat} userId={data?.[0]?.user_id} />
                        <VStack w="full">
                            <Box w="100%">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <HStack w="full">
                                        <Textarea rounded="none" {...register("chatMessage", { required: true })} />
                                        <Button type="submit" rounded="none" variant="outline" h="5rem">Send</Button>
                                    </HStack>
                                </form>
                            </Box>
                        </VStack>
                    </VStack> : <VStack>
                        <Center>
                            <Heading>No chat selected</Heading>
                        </Center>
                    </VStack>}
                </HStack>
            </VStack>
        </Layout>

    );
}

export default Chat;

export const getServerSideProps = async (ctx: any) => {
    // Create authenticated Supabase Client
    const supabase = createServerSupabaseClient(ctx);
    // Check if we have a session
    const {
        data: { session },
    } = await supabase.auth.getSession();


    if (!session)
        return {
            props: {
                user: null,
            },
        };

    // Run queries with RLS on the server

    const { data: userProfileData, error: userProfileError } = await supabase
        .from('profile')
        .select()
        .eq("email", `${session?.user?.email}`)

    // if (userProfileData) console.log("Success", userProfileData)
    if (userProfileError) console.log("Error", userProfileError)
    return {
        props: {
            initialSession: session,
            user: session.user,
            data: userProfileData,
        },
    };
};