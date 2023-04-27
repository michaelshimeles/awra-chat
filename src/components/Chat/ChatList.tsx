import { Avatar, Center, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface ChatListProps {
    roomId: string
    clicked: boolean
}

const ChatList: React.FC<ChatListProps> = ({ roomId, clicked }) => {

    const [chatHistory, setChatHistory] = useState<any>(null)
    const [chatUserName, setChatUserName] = useState<any>(null)

    const supabase = useSupabaseClient()

    useEffect(() => {
        getChatInfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const getUserInfo = async (id: any) => {

        let { data: profile, error } = await supabase
            .from('profile')
            .select('username')
            .eq("user_id", id)

        if (profile) return profile[0]?.username
    }


    return (
        <VStack border="1px solid" borderColor={clicked ? "gray.700" : "gray.900"} p="1rem" _hover={{ borderColor: "gray.700" }} w="100%" >
            {chatHistory?.map((chat: any, index: any) => (
                <VStack key={index}>
                    <HStack w="full" justify="flex-start" gap="1rem">
                        {chat?.group_users_id?.map((info: any, index: number) => (
                            <PromiseWrapper key={index} promise={getUserInfo(info)}>
                                {(res: any) => <Heading fontSize="sm">{res}</Heading>}
                            </PromiseWrapper>
                        ))}
                    </HStack>
                    {/* <Text>{${chatHistory?.[chatHistory?.length - 1]?.message}.substr(0, 30) + "..."}</Text> */}
                </VStack>
            ))}
        </VStack>
    );
}

// PromiseWrapper component
interface PromiseWrapperProps {
    promise: Promise<any>;
    children: (result: any) => React.ReactNode;
}

function PromiseWrapper({ promise, children }: PromiseWrapperProps) {
    const [result, setResult] = useState<any>(null);
    useEffect(() => {
        promise.then((res) => setResult(res));
    }, [promise]);

    if (result === null) {
        return <></>; // Or some kind of loading state
    }
    return <>{children(result)}</>;
}


export default ChatList;