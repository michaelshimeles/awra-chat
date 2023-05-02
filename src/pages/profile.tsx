import { DeleteIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Editable, EditableInput, EditablePreview, Flex, HStack, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tooltip, VStack, useDisclosure, useToast } from '@chakra-ui/react';
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import dynamic from 'next/dynamic';
import { InfoIcon } from "@chakra-ui/icons"

const ShakingButton = dynamic(
    () => import('@/components/Button/ShakingButton/ShakingButton')
);
const Friends = dynamic(() => import('@/components/Friends/Friends'));
const Layout = dynamic(() => import('@/components/Layout/Layout'));
const Protected = dynamic(() => import('@/components/Protected/Protected'));


interface profileProps {
    user: any,
    data: any
}

interface ProfileImagePickerProps {
    data: any,
    isOpen: any,
    onClose: any
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({ isOpen, onClose, data }) => {

    const supabase = useSupabaseClient();
    const [images, setImages] = useState<any>(null)

    const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null)

    const [selected, setSelected] = useState<any>(null)
    const [profileLoading, setProfileLoading] = useState<boolean>(false)
    const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false)

    const toast = useToast()

    const router = useRouter()

    function handleRefresh() {
        router.reload()
    }
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const getUploadedImages = async () => {
        const { data: uploadedImages, error } = await supabase
            .storage
            .from('profile')
            .list(data?.[0]?.user_id, {
                // limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            })

        if (uploadedImages) {
            setImages(uploadedImages)
            return
        }

        if (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        getUploadedImages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadSuccess])

    const onSubmit = async (formData: any) => {
        setUploadSuccess(false)
        // console.log(formData)
        setImageUploadLoading(true)

        const avatarFileName = formData?.profile_img[0]?.name

        const file = new File([formData?.profile_img[0]], avatarFileName, {
            type: "image/*",
            lastModified: new Date().getTime(),
        })

        const { data: imgData, error } = await supabase
            .storage
            .from('profile')
            .upload(`${data?.[0]?.user_id + "/" + avatarFileName + "_" + Date.now()
                }`, file, {
                cacheControl: '3600',
                upsert: false
            })


        if (imgData) {
            setUploadSuccess(true)
            toast({
                title: 'Image uploaded.',
                description: "You may close the card.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            setImageUploadLoading(false)
            return imgData
        }

        if (error) {
            setUploadSuccess(false)
            toast({
                title: 'Image upload failed.',
                description: "Try again, the upload failed.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
            return error
        }
    };

    const handleMakeProfilePic = async (image: string) => {
        setProfileLoading(true)

        const { data: profileImageData, error } = await supabase
            .from('profile')
            .update({ profile_img: image })
            .eq('user_id', data[0]?.user_id)

        if (profileImageData) {
            setProfileLoading(false)
            return profileImageData
        }

        if (error) {
            console.log(error)
            return error
        }

    }

    const handleImageDelete = async (imageName: string) => {
        const { data: deleteData, error } = await supabase
            .storage
            .from('profile')
            .remove([`${data[0]?.user_id}/${imageName}`])

        if (deleteData) {
            getUploadedImages()
            return deleteData
        }

        if (error) {
            console.log(error)
            return error
        }

    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent rounded="none" bgColor="blackAlpha.900" border="1px solid" borderColor="gray.700">
                {!selected ? <ModalHeader>Image Gallery</ModalHeader> : <ModalHeader>Make it your Profile Picture or Delete It</ModalHeader>}
                <ModalCloseButton rounded="none" />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <VStack>
                            {images && <HStack wrap="wrap" pb={50} gap="1rem">
                                {images?.map((image: any) => {
                                    const { data: imageData } = supabase
                                        .storage
                                        .from('profile')
                                        .getPublicUrl(`${data[0]?.user_id}/${image?.name}`, {
                                            download: false,
                                        })

                                    // console.log(index, imageData?.publicUrl)

                                    if (image?.name === ".emptyFolderPlaceholder") return

                                    return selected === imageData?.publicUrl ? (
                                        <Box
                                            key={image?.id}
                                            onClick={() => {
                                                setSelected(imageData?.publicUrl);
                                            }}
                                            border="2px solid"
                                            borderColor="whiteAlpha.700"
                                        >
                                            <Image src={imageData?.publicUrl} w={100} alt="uploaded" />
                                            <DeleteIcon onClick={() => handleImageDelete(image?.name)} _hover={
                                                { cursor: "pointer" }
                                            } />
                                        </Box>
                                    ) : (
                                        <Box
                                            key={image?.id}
                                            onClick={() => {
                                                setSelected(imageData?.publicUrl);
                                            }}
                                        >
                                            <Image src={imageData?.publicUrl} w={100} alt="uploaded" />
                                        </Box>
                                    );

                                })}
                            </HStack>}
                            <Input type="file" variant="none" {...register("profile_img")} w="100%" onClick={() => setSelected(null)} />
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button rounded="none" variant="outline" mr={3} onClick={() => {
                            onClose()
                            handleRefresh()
                        }
                        }
                        >
                            Close
                        </Button>
                        {selected ? <Button isLoading={profileLoading} variant="outline" rounded="none" onClick={() => {
                            handleMakeProfilePic(selected).then(() => {
                                handleRefresh()
                            })
                            // onClose()
                        }} w="100%">Make Profile Picture</Button> : <Button variant="outline" isLoading={imageUploadLoading} rounded="none" type='submit' w="100%">Upload</Button>}

                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

const Profile: React.FC<profileProps> = ({ user, data }) => {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const refreshRouter = useRouter()
    // Supabase client
    const supabase = useSupabaseClient();
    const router = useRouter();

    if (!user)
        return (
            <Protected title="Protected Route" info="This is a protected route" forward='/' />
        );


    const handleFirstName = async (firstName: any) => {
        if (data[0]?.first_name === firstName) return


        const { data: userData, error } = await supabase
            .from('profile')
            .update({ first_name: firstName })
            .eq("user_id", data[0]?.user_id)
            .select()

        if (error) return error

        if (userData) {
            toast({
                title: 'First Name updated.',
                description: "We've updated your First Name successfull.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            return "First Name Updated"
        }
    }

    const handleLastName = async (lastName: any) => {
        if (data[0]?.last_name === lastName) return

        const { data: userData, error } = await supabase
            .from('profile')
            .update({ last_name: lastName })
            .eq("user_id", data[0]?.user_id)
            .select()

        if (error) return error
        if (userData) {
            toast({
                title: 'Last Name updated.',
                description: "We've updated your Last Name successfull.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            return "Last Name Updated"
        }
    }

    const username = async (username: any) => {
        if (data[0]?.username === username) return

        const { data: userData, error } = await supabase
            .from('profile')
            .update({ username })
            .eq("user_id", data[0]?.user_id)
            .select()

        if (error) {
            console.log(error)
            toast({
                title: "Username Error",
                description: error.message,
                status: "error",
                duration: 9000,
                isClosable: true,
            })
            return error
        }
        if (userData) {
            toast({
                title: 'Username updated.',
                description: "We've updated your username successfull.",
                status: 'success',
                duration: 9000,
                isClosable: true,
            })
            return "Username Updated"
        }

    }

    return (
        <Layout>
            <VStack pt="5rem" px="2rem">
                <HStack border="1px solid" rounded="sm" p="2rem" gap="1rem" borderColor="gray.900" w={["15rem", "25rem"]} justify="center" align='center'>
                    <Avatar src={data[0]?.profile_img} bgColor="blue.700" _hover={{ cursor: "pointer" }} onClick={onOpen} border="1px solid" borderColor="gray.900" size="xl" />
                    <VStack>
                        <Editable defaultValue={data[0]?.first_name} w="full" onSubmit={handleFirstName}>
                            <EditablePreview />
                            <EditableInput rounded="none" w="full" />
                        </Editable>
                        <Editable defaultValue={data[0]?.last_name} w="full" onSubmit={handleLastName} >
                            <EditablePreview />
                            <EditableInput rounded="none" w="full" />
                        </Editable>
                        <Editable defaultValue={data[0]?.username} w="full" onSubmit={username} >
                            <EditablePreview />
                            <EditableInput rounded="none" w="full" />
                        </Editable>
                    </VStack>
                </HStack>
                <HStack>
                    {/* <Button rounded="none" variant="outline" onClick={handleSignOut}>Log out</Button> */}
                    <ShakingButton onClick={() => router.push("/chat")}>Chat</ShakingButton>
                    <Tooltip hasArrow label='Coming soon' bg='gray.900' color='black' textColor="white">
                        <VStack>
                            <ShakingButton onClick={() => console.log("Build")}>Need a Friend</ShakingButton>
                        </VStack>
                    </Tooltip>
                    <Tooltip hasArrow label='You can change your First, Last & User name by just clicking on them. You can upload a new profile picture by click on the avatar' bg='gray.900' color='black' textColor="white">
                        <InfoIcon />
                    </Tooltip>
                </HStack>
                <ProfileImagePicker isOpen={isOpen} onClose={onClose} data={data} />
                <Friends data={data} />
            </VStack>
        </Layout>
    );
}

export default Profile;


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
