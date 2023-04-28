import { Box, Button, Center, HStack, Heading, Skeleton, Textarea, VStack } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ChatHistory = dynamic(() => import('@/components/Chat/ChatHistory'))
const Layout = dynamic(() => import('@/components/Layout/Layout'))
const ChatList = dynamic(() => import('@/components/Chat/ChatList'))
const Protected = dynamic(() => import("@/components/Protected/Protected"))

interface ChatProps {
    user: any,
    data: any
}


const Chat: React.FC<ChatProps> = ({ data }) => {
    const [messageRooms, setMessageRooms] = useState<any>(null)
    const [loadingRooms, setLoadingRooms] = useState<any>(null)
    // const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null)
    const [historyKey, setHistoryKey] = useState(0);

    const router = useRouter()

    const { roomId } = router.query

    const supabase = useSupabaseClient()

    const refreshHistory = () => {
        setHistoryKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        getMessageRooms()
        // setSelectedChatRoom(roomId)
    }, [roomId]); // use roomId as a dependency of useEffect instead of calling setSelectedChatRoom conditionally

    const getMessageRooms = async () => {
        setLoadingRooms(true)
        const { data: messages, error } = await supabase
            .from('messages')
            .select();

        if (messages) {
            const chats = messages.map((room) => {
                if (room?.group_users_id.includes(data?.[0]?.user_id)) return room.room_id
            })
            setMessageRooms(chats)
            setLoadingRooms(false)
            return
        }
        if (error) {
            console.log(error)
            return
        }
    }

    const handleChatSelection = (chats: any) => {
        // setSelectedChatRoom(chats)
        router.replace("/chat/" + chats)
    }

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    const onSubmit = (formData: any) => {
        submitMessage(data?.[0]?.user_id, formData?.chatMessage).then((result) => {
            console.log("result", result)
            reset()
            refreshHistory();
        })
    }

    const submitMessage = async (userId: any, message: any) => {
        const { data: sendingMessageData, error } = await supabase
            .from('chatmessages')
            .insert({
                room_id: roomId,
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
                    <VStack w="20%">
                        {messageRooms?.map((chats: any, index: number) => {
                            if (chats === undefined) return
                            return (
                                <Box key={index} onClick={() => handleChatSelection(chats)}>
                                    <ChatList roomId={chats} data={data} />
                                </Box>
                            )
                        })}
                    </VStack>
                    {roomId && <VStack w="80%">
                        <ChatHistory roomId={roomId} userId={data?.[0]?.user_id} historyKey={historyKey} />
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