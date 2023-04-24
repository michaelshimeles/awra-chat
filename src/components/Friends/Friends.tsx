import { AddIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Avatar, HStack, Heading, Input, InputGroup, InputRightElement, Spinner, Text, VStack } from '@chakra-ui/react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { UUID } from 'crypto';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

interface FriendsProps {
    data: any
}

const Friends: React.FC<FriendsProps> = ({ data }) => {

    const supabase = useSupabaseClient()
    const [friendsInfo, setFriendsInfo] = useState<any>([])
    const [loadingFriend, setLoadingFriend] = useState<boolean | null>(null)
    const [friendRequests, setFriendRequests] = useState<any>([])
    const [loadingFriendRequest, setLoadingFriendRequest] = useState<boolean | null>(null)
    const [searchResult, setSearchResult] = useState<any>([])
    const [value, setValue] = useState<any>("")
    const refreshRouter = useRouter()

    useEffect(() => {
        getFriends()
        getFriendRequests()
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
            setSearchResult(searchData)
        }

    }

    const handleClearSearch = () => {
        setValue(null)
        setSearchResult(null)
    }

    const handleFriendRequest = (userId: UUID, username: string) => {
        handleClearSearch()
    }

    const handleAcceptFriendRequest = async (friendId: UUID) => {

        const friends = friendsInfo.map((friend: { user_id: any; }) => {
            return friend.user_id
        })


        const { data: friendData, error } = await supabase
            .from('friends')
            .update({ friends: [...friends, friendId] })
            .eq('user_id', data[0]?.user_id)    // Correct
            .select()


        if (friendData) {
            const friendRequest = friendRequests.filter((friend: { user_id: any; }) => {
                return friend.user_id !== friendId
            })

            console.log("friendRequest", friendRequest)

            const { data: friendRequestData, error } = await supabase
                .from('friends')
                .update({ friend_requests: [friendRequest] })
                .eq('user_id', data[0]?.user_id)    // Correct
                .select()


            if (friendRequestData) {
                console.log("friendRequestData", friendRequestData)
                handleRefresh()
                return friendRequestData
            }
            if (error) {
                console.log("Error", error)
                return error
            }

        }
        if (error) {
            console.log("Error", error)
            return error
        }
    }


    return (
        <VStack>
            <HStack w="100%" gap="3rem" border="1px solid" rounded="none" borderColor="gray.900" p="1rem" align="flex-start">
                <VStack>
                    <Heading fontSize="sm">Friends List</Heading>
                    <VStack align="flex-start">
                        {!loadingFriend ? friendsInfo?.map((friend: any, index: any) => {
                            return (<HStack key={index}>
                                <Avatar src={friend?.profile_img} size="sm" />
                                <Text>{friend?.username}</Text>
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
                                <CheckIcon onClick={() => handleAcceptFriendRequest(friend?.user_id)} cursor="pointer"
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
                                children={<CloseIcon color='gray.300' onClick={handleClearSearch} />}
                            />}
                        </InputGroup>
                    </HStack>
                    <VStack w="100%" align="flex-start">
                        {searchResult?.map((result: { username: string, user_id: UUID }) => {
                            return (
                                <HStack justify="space-between" w="full">
                                    <Text key={result?.user_id} _hover={{
                                        cursor: "pointer", textDecoration: "underline"
                                    }}>{result?.username}</Text>
                                    <AddIcon onClick={() => handleFriendRequest(result?.user_id, result?.username)} />
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
