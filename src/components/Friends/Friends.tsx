import React, { useEffect, useState } from 'react'
import Layout from '../Layout/Layout';
import { Avatar, HStack, Heading, VStack, Text, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { UUID } from 'crypto';
import { CloseIcon, AddIcon } from '@chakra-ui/icons'

interface FriendsProps {
    data: any
}

const Friends: React.FC<FriendsProps> = ({ data }) => {

    const supabase = useSupabaseClient()
    const [friendsInfo, setFriendsInfo] = useState<any>([])
    const [searchResult, setSearchResult] = useState<any>([])
    const [value, setValue] = useState<any>("")

    useEffect(() => {
        getFriends()
    }, [])


    const getFriends = async () => {
        const { data: friendData, error } = await supabase
            .from('friends')
            .select()
            .eq('follower_id', data[0]?.user_id)

        let friendsArr: Array<object> = []

        if (friendData) {
            await Promise.all(friendData?.map(async (id) => {
                const { data: friendsList, error } = await supabase
                    .from('profile')
                    .select()
                    .eq('user_id', id?.followee_id)

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

            console.log("sortedFriends", sortedFriends)

            return setFriendsInfo(sortedFriends)
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
            console.log(searchData)
            // Do something with the retrieved data
            setSearchResult(searchData)
        }

    }

    const handleClearSearch = () => {
        setValue(null)
        setSearchResult(null)
    }

    const handleFriendRequest = (userId: UUID, username: string) => {
        console.log(userId, username)
        handleClearSearch()
    }

    return (
        <VStack>
            <HStack w="100%" gap="3rem" border="1px solid" rounded="none" borderColor="gray.900" p="1rem" align="flex-start">
                <VStack>
                    <Heading fontSize="sm">Friends List</Heading>
                    <VStack align="flex-start">
                        {friendsInfo?.map((friend: any, index: any) => {
                            return (<HStack key={index}>
                                <Avatar src={friend?.profile_img} size="sm" />
                                <Text>{friend?.username}</Text>
                            </HStack>)
                        })}
                    </VStack>
                </VStack>
                <VStack>
                    <Heading fontSize="sm">Friends Request</Heading>
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
