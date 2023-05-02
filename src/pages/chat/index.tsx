import Protected from '@/components/Protected/Protected';
import { useGetMessageRoom } from '@/hooks/useGetMessageRoom';
import { Box, Center, HStack, Heading, Show, Spinner, VStack } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useState } from 'react';


const Layout = dynamic(() => import('@/components/Layout/Layout'))
const ChatList = dynamic(() => import('@/components/Chat/ChatList'))

interface ChatProps {
    user: any,
    data: any
    children: any;
}


export const Chat: React.FC<ChatProps> = ({ data, children }) => {
    const { data: getMessageRooms, isLoading } = useGetMessageRoom(data?.[0]?.user_id);

    const [highlightedChat, setHighlightedChat] = useState<any>(null)
    const router = useRouter()

    console.log("Query", router.query)

    const handleChatSelection = (chats: any) => {
        router.push("/chat/" + chats?.room_id)
    }

    const handleBorderSelect = (chats: any) => {
        setHighlightedChat(chats)
    }

    if (!data)
        return (
            <Protected title="Protected Route" info="This is a protected route" forward='/' />
        );

    return (
        <Layout>
            <VStack>
                <HStack align="flex-start" justify="flex-start" pt="5rem" w="80%">
                    <Show above='md'>
                        <VStack w="20%">
                            {!isLoading ? getMessageRooms?.map((chats: any, index: number) => {
                                return (
                                    <Box key={index} onClick={() => {
                                        handleChatSelection(chats)
                                        handleBorderSelect(chats?.room_id)
                                    }} w="100%">
                                        <ChatList roomId={chats?.room_id} data={data} highlightedChat={highlightedChat} />
                                    </Box>
                                )
                            }) : <VStack>
                                <Spinner />
                            </VStack>}
                        </VStack>
                    </Show>
                    <Show below='md'>
                        <VStack w="20%">
                            {getMessageRooms?.map((chats: any, index: number) => {
                                if (chats === undefined || chats === null) return
                                return (
                                    <Box key={index} onClick={() => {
                                        handleChatSelection(chats)
                                        handleBorderSelect(chats?.room_id)
                                    }} w="100%">
                                        <ChatList roomId={chats?.room_id} data={data} highlightedChat={highlightedChat} />
                                    </Box>
                                )
                            })}
                        </VStack>
                    </Show>
                    <VStack w="100%" justify="center" h="7rem">
                        <Center>
                            <Heading>No chat selected</Heading>
                        </Center>
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

    if (userProfileError) console.log("Error", userProfileError)
    return {
        props: {
            initialSession: session,
            user: session.user,
            data: userProfileData,
        },
    };
};