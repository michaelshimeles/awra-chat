import { useGetUserInfo } from '@/hooks/useGetUserInfo';
import { HStack, Text } from '@chakra-ui/react';
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ShakingButton = dynamic(
    () => import('@/components/Button/ShakingButton/ShakingButton')
);

interface NavBarProps {

}

const NavBar: React.FC<NavBarProps> = ({ }) => {
    // const [userInfo, setUserInfo] = useState<any>(null)
    const refreshRouter = useRouter()
    const supabase = useSupabaseClient();
    const router = useRouter()

    // user session
    const user = useUser();

    const { data: userInfo, isLoading: isLoadingFriends } = useGetUserInfo(user?.email)

    function handleRefresh() {
        refreshRouter.reload()
    }

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return error;
        }
        console.log("Signed out")
        handleRefresh()
        return;
    };


    return (
        <HStack w="100%" p="1rem" justify="flex-end">
            {user &&
                <>
                    <Text as="b" fontSize="sm">Username:</Text> <span>{userInfo?.[0]?.username}</span>
                    <ShakingButton onClick={() => router.push("/profile")} >
                        Profile
                    </ShakingButton>
                </>}
            {
                user && <ShakingButton onClick={handleSignOut}
                >Logout</ShakingButton>
            }
        </HStack >
    );
}

export default NavBar;