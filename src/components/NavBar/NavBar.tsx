import { Button, HStack, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import ShakingButton from '../Button/ShakingButton/ShakingButton';

interface NavBarProps {

}

const NavBar: React.FC<NavBarProps> = ({ }) => {
    const refreshRouter = useRouter()
    const supabase = useSupabaseClient();
    const router = useRouter()

    // user session
    const user = useUser();

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
            {user && <ShakingButton onClick={() => router.push("/profile")} >
                Profile
            </ShakingButton>}
            {
                user && <ShakingButton onClick={handleSignOut}
                >Logout</ShakingButton>
            }
        </HStack >
    );
}

export default NavBar;