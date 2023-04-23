import { Button, HStack, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

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
            {user && <Button onClick={() => router.push("/profile")} variant="outline" rounded="none">
                Profile
            </Button>}
            {user && <Button rounded="none" variant="outline" onClick={handleSignOut}>Logout</Button>}
        </HStack>
    );
}

export default NavBar;