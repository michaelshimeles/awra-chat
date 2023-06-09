import {
  Button,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from "@chakra-ui/react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import dynamic from 'next/dynamic';
import Head from "next/head";
import { useRouter } from 'next/router';
const Layout = dynamic(() => import('@/components/Layout/Layout'));
const Login = dynamic(() => import('@/components/Login/Login'));
const SignUp = dynamic(() => import('@/components/SignUp/SignUp'));

interface HomeProps {
  userServer: any
}

const Home: React.FC<HomeProps> = ({ userServer }) => {

  const router = useRouter()
  const user = useUser()
  
  return (
    <Layout>
      <Head>
        <title>Awra Chat</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <VStack w="full" height="100vh" gap="3rem">
        <VStack pt="5rem">
          <Heading fontSize="7xl">Welcome to Awra</Heading>
          <Text>
            A secure chat app created to make Michael Shimeles feel like a great
            developer.
          </Text>
        </VStack>
        <VStack>
          {!user ? <Tabs variant="line" colorScheme="blue" size="md">
            <TabList>
              <Tab>Sign Up</Tab>
              <Tab>Login</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SignUp />
              </TabPanel>
              <TabPanel>
                <Login />
              </TabPanel>
            </TabPanels>
          </Tabs> :
            <Button onClick={() => router.push("/profile")} variant="outline" rounded="none" w="full">
              Profile
            </Button>
          }
        </VStack>
      </VStack>
    </Layout>
  );
};

export default Home;

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
        userServer: null,
      },
    };

  // Run queries with RLS on the server


  return {
    props: {
      initialSession: session,
      userServer: session.user,
    },
  };
};
