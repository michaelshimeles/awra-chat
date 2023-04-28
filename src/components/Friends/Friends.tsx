import { AddIcon, ChatIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Avatar, HStack, Heading, Input, InputGroup, InputRightElement, Spinner, Text, VStack, useToast } from '@chakra-ui/react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { UUID } from 'crypto';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface FriendsProps {
    data: any
}

const Friends: React.FC<FriendsProps> = ({ data }) => {

    const supabase = useSupabaseClient()
    const [friendsInfo, setFriendsInfo] = useState<any>([])
    const [friendFriendsInfo, setFriendFriendsInfo] = useState<any>([])
    const [loadingFriend, setLoadingFriend] = useState<boolean | null>(null)
    const [friendRequests, setFriendRequests] = useState<any>([])
    const [loadingFriendRequest, setLoadingFriendRequest] = useState<boolean | null>(null)
    const [searchResult, setSearchResult] = useState<any>([])
    const [value, setValue] = useState<any>("")
    const refreshRouter = useRouter()
    const router = useRouter()
    const toast = useToast();

    supabase.channel('custom-all-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'friends' },
            (payload) => {
                console.log('Change received!', payload)
                getFriends()
                getFriendRequests()
            }
        )
        .subscribe()

    useEffect(() => {
        getFriends()
        getFriendRequests()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handleRefresh() {
        refreshRouter.reload()
    }

    const getFriends = async () => {
        setLoadingFriend(true)
        const { data: friendData, error } = await supabase
            .from('friends')
            .select("friends")
            .eq('user_id', data[0]?.user_id)

        let friendsArr: Array<object> = []

        const friendsId = friendData?.[0]?.friends

        if (friendData) {
            await Promise.all(friendsId?.map(async (id: string) => {

                const { data: friendsList, error } = await supabase
                    .from('profile')
                    .select()
                    .eq('user_id', id)

                if (error) {
                    console.log(error)
                    return error
                }


                if (friendsList) {
                    friendsArr?.push(friendsList[0])
                }
            }))

            const sortedFriends = friendsArr.sort((a: any, b: any) => {
                const usernameA = a?.username.toLowerCase()
                const usernameB = b?.username.toLowerCase()
                if (usernameA < usernameB) return -1
                if (usernameA > usernameB) return 1
                return 0
            })

            setLoadingFriend(false)
            return setFriendsInfo(sortedFriends)
        }


        if (error) {
            console.log(error)
            return
        }
    }

    const getFriendRequests = async () => {
        setLoadingFriendRequest(true)
        const { data: friendData, error } = await supabase
            .from('friends')
            .select("friend_requests")
            .eq('user_id', data[0]?.user_id)

        let friendsArr: Array<object> = []

        const friendsId = friendData?.[0]?.friend_requests

        if (friendData) {
            await Promise.all(friendsId?.map(async (id: string) => {

                const { data: friendsList, error } = await supabase
                    .from('profile')
                    .select()
                    .eq('user_id', id)

                if (error) {
                    console.log(error)
                    return error
                }


                if (friendsList) {
                    friendsArr?.push(friendsList[0])
                }
            }))

            const sortedFriends = friendsArr.sort((a: any, b: any) => {
                const usernameA = a?.username.toLowerCase()
                const usernameB = b?.username.toLowerCase()
                if (usernameA < usernameB) return -1
                if (usernameA > usernameB) return 1
                return 0
            })
            setLoadingFriendRequest(false)
            return setFriendRequests(sortedFriends)
        }


        if (error) {
            console.log(error)
            return
        }
    }

    const getFriendFriends = async (friendId: any) => {
        const { data: friendData, error } = await supabase
            .from('friends')
            .select("friends")
            .eq('user_id', friendId)

        let friendsArr: Array<object> = []

        const friendsId = friendData?.[0]?.friends

        if (friendData) {
            await Promise.all(friendsId?.map(async (id: string) => {

                const { data: friendsList, error } = await supabase
                    .from('profile')
                    .select()
                    .eq('user_id', id)

                if (error) {
                    console.log(error)
                    return error
                }


                if (friendsList) {
                    friendsArr?.push(friendsList[0])
                }
            }))

            const sortedFriends = friendsArr.sort((a: any, b: any) => {
                const usernameA = a?.username.toLowerCase()
                const usernameB = b?.username.toLowerCase()
                if (usernameA < usernameB) return -1
                if (usernameA > usernameB) return 1
                return 0
            })

            return setFriendFriendsInfo(sortedFriends)
        }


        if (error) {
            console.log(error)
            return
        }
    }

    const handleSearch = async (e: any) => {
        let searchTerm = e.target.value
        setValue(e.target.value)

        if (searchTerm.length === 0) return
        const { data: searchData, error } = await supabase
            .from('profile')
            .select()
            .or(`username.ilike.%${searchTerm}%`)

        if (error) {
            console.log(error)
            return
        }

        if (searchData) {
            // Do something with the retrieved data
            // searchData.map((result) => {
            //     return result
            // })
            console.log("friendsInfo", friendsInfo)
            console.log("friendRequests", friendRequests)
            console.log("searchData", searchData)
            setSearchResult(searchData)
        }

    }

    const handleClearSearch = () => {
        setValue(null)
        setSearchResult(null)
    }

    const handleAcceptFriendRequest = async (friendId: UUID) => {

        // All the friends of the current user
        const friends = friendsInfo.map((friend: { user_id: any; }) => {
            return friend.user_id
        })


        const friendFriends = friendFriendsInfo.map((friend: { user_id: any; }) => {
            return friend.user_id
        })



        // Adding all the current friends and new friend to current users friends table
        const { data: friendData, error } = await supabase
            .from('friends')
            .update({ friends: [...friends, friendId] })
            .eq('user_id', data[0]?.user_id)    // Correct
            .select()


        // If new friend is added, update friend request field by removing the accepted friend request
        if (friendData) {
            const friendRequest = friendRequests.filter((friend: { user_id: any; }) => {
                return friend.user_id !== friendId
            })

            // Update the friends field and add current user as their friend
            const { data: friendFriendsData, error: friendFriendsError } = await supabase
                .from('friends')
                .update({ friends: [...friendFriends, data?.[0]?.user_id] })
                .eq('user_id', friendId)    // Correct
                .select()

            // Update current users friend field
            const { data: friendRequestData, error } = await supabase
                .from('friends')
                .update({ friend_requests: [friendRequest] })
                .eq('user_id', data[0]?.user_id)    // Correct
                .select()


            if (friendRequestData && friendFriendsData) {
                handleRefresh()
                return friendRequestData
            }
            if (error) {
                console.log("Error", error)
                return error
            }
            if (friendFriendsError) {
                console.log("friendFriendsError", friendFriendsError)
                return friendFriendsError
            }

        }
        if (error) {
            console.log("Error", error)
            return error
        }
    }

    const handleSendingFriendRequest = async (friendId: UUID) => {
        let friendRequest = friendRequests.map((friend: { user_id: any; }) => {
            return friend.user_id
        })

        console.log("friendRequest", friendRequest)

        friendRequest.push(data?.[0]?.user_id)
        console.log("allFriendRequests", friendRequest)

        const { data: friendRequestData, error } = await supabase
            .from('friends')
            .update({ friend_requests: friendRequest })
            .eq('user_id', friendId)
            .select()

        if (friendRequestData) {
            console.log(friendRequestData)
            handleClearSearch()
            toast({
                title: 'Friend Request sent.',
                // description: "We've created your account for you.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            return friendRequestData
        }

        if (error) {
            console.log(error)
            return error
        }
    }

    const handleMessageFriend = async (friendId: UUID) => {

        const { data: messages, error } = await supabase
            .from('messages')
            .select('room_id')

        const myId = data?.[0]?.user_id

        const roomId = [myId, friendId]

        roomId.sort((a, b) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });


        let roomCode = `${roomId[0].substr(0, 5) + "_" + roomId[1].substr(0, 5)}`

        const { data: createChatRoom, error: createChatRoomError } = await supabase
            .from('messages')
            .insert({ room_id: uuidv4(), group_users_id: [data?.[0]?.user_id, friendId], room_code: roomCode })
            .select()

        if (createChatRoom) {
            console.log(createChatRoom)
            router.push("/chat")
            return
        }

        if (createChatRoomError) {
            console.log(createChatRoomError)
            router.push("/chat")
            return error
        }

        // router.push("/chat?f=" + `${data?.[0]?.user_id}`)
    }

    return (
        <VStack>
            <HStack w="100%" gap="3rem" border="1px solid" rounded="none" borderColor="gray.900" p="1rem" align="flex-start">
                <VStack>
                    <Heading fontSize="sm">Friends List</Heading>
                    <VStack align="flex-start">
                        {!loadingFriend ? friendsInfo?.map((friend: any, index: any) => {
                            return (<HStack key={index} onClick={() => handleMessageFriend(friend?.user_id)} _hover={{
                                cursor: "pointer"
                            }}>
                                <Avatar src={friend?.profile_img} size="sm" />
                                <Text>{friend?.username}</Text>
                                <ChatIcon />
                            </HStack>)
                        }) : <Spinner />}
                    </VStack>
                </VStack>
                <VStack>
                    <Heading fontSize="sm">Friends Request</Heading>
                    <VStack align="flex-start">
                        {!loadingFriendRequest ? friendRequests?.map((friend: any, index: any) => {
                            return (<HStack key={index}>
                                <Avatar src={friend?.profile_img} size="sm" />
                                <Text>{friend?.username}</Text>
                                <CheckIcon onClick={() => {
                                    handleAcceptFriendRequest(friend?.user_id)
                                    getFriendFriends(friend?.user_id)
                                }} cursor="pointer"
                                />
                            </HStack>)
                        }) : <Spinner />}
                    </VStack>
                </VStack>
                <VStack >
                    <Heading fontSize="sm">Search</Heading>
                    <HStack>
                        <InputGroup justifyContent="space-between">
                            <Input rounded="none" defaultValue={value} placeholder="Search" onChange={handleSearch} />
                            {value && <InputRightElement
                                // pointerEvents="fill"
                                cursor="pointer"
                            // eslint-disable-next-line 
                            ><CloseIcon color='gray.300' onClick={handleClearSearch} /></InputRightElement>}
                        </InputGroup>
                    </HStack>
                    <VStack w="100%" align="flex-start">
                        {searchResult?.map((result: { username: string, user_id: UUID }, index: number) => {
                            return (
                                <HStack justify="space-between" w="full" key={result?.user_id}>
                                    <Text _hover={{
                                        cursor: "pointer", textDecoration: "underline"
                                    }}>{result?.username}</Text>
                                    {!friendsInfo[index]?.user_id && <AddIcon onClick={() => handleSendingFriendRequest(result?.user_id)} />}
                                </HStack>
                            )
                        })}
                    </VStack>
                </VStack>
            </HStack>
        </VStack>

    );
}

export default Friends;
