import { Box, Center, HStack, Heading, Skeleton, VStack } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";

const Layout = dynamic(() => import('@/components/Layout/Layout'))
const ChatList = dynamic(() => import('@/components/Chat/ChatList'))

interface ChatProps {
    user: any,
    data: any
}


const Chat: React.FC<ChatProps> = ({ data }) => {

    const [messageRooms, setMessageRooms] = useState<any>(null)
    const [loadingRooms, setLoadingRooms] = useState<any>(null)
    const [clicked, setClicked] = useState<any>(false)
    const [historyKey, setHistoryKey] = useState(0);

    const router = useRouter()


    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    const supabase = useSupabaseClient()

    const refreshHistory = () => {
        setHistoryKey(prevKey => prevKey + 1);
    };


    useEffect(() => {
        getMessageRooms()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getMessageRooms = async () => {

        setLoadingRooms(true)
        const { data: messages, error } = await supabase
            .from('messages')
            .select();

        if (messages) {
            const chats = messages.map((room) => {
                if (room?.group_users_id.includes(data?.[0]?.user_id)) return room.room_id
            })

            // console.log("chats", chats)
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
        console.log("Clicked", chats)
        router.replace(`/chat/${chats}`)
    }

    return (
        <Layout>
            <VStack w="100%">
                <HStack align="flex-start" justify="flex-start" pt="5rem" w="80%">
                    <VStack w="20%">
                        {!loadingRooms ? messageRooms?.map((chats: any, index: number) => {
                            if (chats === undefined) return
                            return (
                                <Box key={index} onClick={() => handleChatSelection(chats)}>
                                    <ChatList roomId={chats}  data={data} />
                                </Box>
                            )
                        }) : <Center>
                            <Skeleton>
                                <Heading>No messages</Heading>
                            </Skeleton>
                        </Center>}
                    </VStack>
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