import ChatHistory from '@/components/Chat/ChatHistory';
import Protected from '@/components/Protected/Protected';
import { useGetMessageRoom } from '@/hooks/useGetMessageRoom';
import { Box, Button, Center, HStack, Heading, Show, Spinner, Textarea, VStack } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@chakra-ui/react';
import { useRef } from 'react';
import { BiMicrophone } from 'react-icons/bi';
import { BsStopCircle } from "react-icons/bs";


const Layout = dynamic(() => import('@/components/Layout/Layout'))
const ChatList = dynamic(() => import('@/components/Chat/ChatList'))

interface ChatProps {
    user: any,
    data: any
    children: any;
}


interface VoiceRecordingProps {
    roomId: string
    userId: string
    audioFile: any
}

const mimeType = "audio/webm";

const VoiceRecording: React.FC<VoiceRecordingProps> = ({ roomId, userId, audioFile }) => {
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [permission, setPermission] = useState<any>(true);
    const [recordingStatus, setRecordingStatus] = useState<any>("inactive");
    const [audioChunks, setAudioChunks] = useState<any>([]);

    const supabase = useSupabaseClient()

    const startRecording = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                // setStream(streamData);

                setRecordingStatus("recording");
                // create a new Blob object

                //create new Media recorder instance using the stream
                // const media: MediaRecorder = new MediaRecorder(streamData, { type: mimeType });
                const media: MediaRecorder = new MediaRecorder(streamData, {
                    mimeType: 'audio/webm;codecs=opus',
                    // audioBitsPerSecond: 128000
                });
                //set the MediaRecorder instance to the mediaRecorder ref
                mediaRecorder.current = media;
                //invokes the start method to start the recording process
                mediaRecorder.current.start();
                let localAudioChunks: any = [];
                mediaRecorder.current.ondataavailable = (event) => {
                    if (typeof event.data === "undefined") return;
                    if (event.data.size === 0) return;
                    localAudioChunks.push(event.data);
                };
                setAudioChunks(localAudioChunks);
            } catch (err) {
                alert(err);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }

    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current?.stop();
        if (mediaRecorder.current) {
            mediaRecorder.current.onstop = async () => {


                const fileReader = new FileReader();
                fileReader.readAsDataURL(audioChunks[0]);
                fileReader.onload = async () => {

                    const base64data = fileReader.result;
                    const { data: sendingAudioMessage, error } = await supabase
                        .from('chatmessages')
                        .insert([
                            { room_id: roomId, user_id: userId, message: base64data, audio: true },
                        ])

                    if (error) {
                        console.log(error)
                        return error
                    }

                    if (sendingAudioMessage) {
                        audioFile(base64data)
                        return
                    }
                };

            };
        }
    };

    return (
        <VStack>
            <VStack>
                {permission && recordingStatus === "inactive" ? (
                    <Icon onClick={startRecording} type="button" as={BiMicrophone} cursor="pointer" border="1px solid" borderColor="gray.900" bgColor="whiteAlpha.100" rounded="full" />
                ) : null}
                {recordingStatus === "recording" ? (
                    <Icon onClick={stopRecording} type="button" as={BsStopCircle} cursor="pointer" border="1px solid" borderColor="gray.900" bgColor="whiteAlpha.100" rounded="full" />
                ) : null}
            </VStack>
        </VStack>
    );
}

export const Chat: React.FC<ChatProps> = ({ data, children }) => {
    const { data: getMessageRooms, isLoading } = useGetMessageRoom(data?.[0]?.user_id);
    const [selectedChat, setSelectedChat] = useState<any>(null)
    const [audio, setAudio] = useState<any>(null)
    const supabase = useSupabaseClient()

    const handleChatSelection = (chats: any) => {
        setSelectedChat(chats)
    }
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    const onSubmit = (formData: any) => {
        submitMessage(data?.[0]?.user_id, formData?.chatMessage).then((result) => {
            reset()
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
            return
        }
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
                                if (chats === undefined) return
                                return (
                                    <Box key={index} onClick={() => handleChatSelection(chats)} w="100%">
                                        <ChatList roomId={chats} data={data} />
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
                                if (chats === undefined) return
                                return (
                                    <Box key={index} onClick={() => handleChatSelection(chats)} w="100%">
                                        <ChatList roomId={chats} data={data} />
                                    </Box>
                                )
                            })}
                        </VStack>
                    </Show>
                    {selectedChat ? <VStack w="80%">
                        <ChatHistory roomId={selectedChat} userId={data?.[0]?.user_id} audio={audio} />
                        <VStack w="full">
                            <Box w="100%">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <HStack w="full">
                                        <VoiceRecording roomId={selectedChat} userId={data?.[0]?.user_id} audioFile={setAudio} />
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