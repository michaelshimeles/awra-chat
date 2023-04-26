import ChatHistory from '@/components/Chat/ChatHistory';
import ChatList from '@/components/Chat/ChatList';
import Layout from '@/components/Layout/Layout';
import { Center, HStack, Heading, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/router';

interface chatProps {
    user: any,
    data: any
}

const chat: React.FC<chatProps> = ({ user, data }) => {

    const [messageRooms, setMessageRooms] = useState<any>(null)
    const supabase = useSupabaseClient()
    const router = useRouter()
    const { f } = router.query

    // console.log("friend", f)
    useEffect(() => {
        getMessageRooms()
    }, [])

    const getMessageRooms = async () => {

        const { data: messages, error } = await supabase
            .from('messages')
            .select();

        if (messages) {

            const chats = messages.map((room) => {
                if (room?.group_users_id.includes(data?.[0]?.user_id)) return room.room_id
            })

            // console.log("chats", chats)
            setMessageRooms(chats)
            return
        }
        if (error) {
            console.log(error)
            return
        }
    }
    return (
        <Layout>
            <VStack w="100%">
                <HStack justify="flex-start" pt="5rem" w="80%">
                    <VStack>
                        {messageRooms?.[0] ? messageRooms?.map((chats: any, index: number) => {
                            return (
                                <ChatList key={index} roomId={chats} />
                            )
                        }) : <Center>
                            <Heading>No messages</Heading>
                        </Center>}
                    </VStack>
                    {/* <ChatHistory /> */}
                </HStack>
            </VStack>
        </Layout>
    );
}

export default chat;

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