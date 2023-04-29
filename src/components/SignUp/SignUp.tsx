import {
  Button,
  HStack,
  Heading,
  Input,
  VStack,
  useToast
} from "@chakra-ui/react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

interface SignUpProps {
}

const SignUp: React.FC<SignUpProps> = () => {
  const toast = useToast();
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Supabase client
  const supabase = useSupabaseClient();

  // user session
  const user = useUser();

  // Form submission
  const onSubmit = (data: any) => {
    signUp(data);
  };

  // Checking signUp info with supabase
  const signUp = async (data: any) => {
    const { data: signUp, error } = await supabase.auth.signUp({
      email: data?.email,
      password: data?.password,
    });

    const uniqueID = uuidv4()

    // Updating user table
    const { data: userTableData, error: userTableError } = await supabase
      .from('profile')
      .insert({ user_id: uniqueID, first_name: data?.firstName, last_name: data?.lastName, email: data?.email, username: `${data?.firstName}`.toLowerCase() + "_" + `${data?.lastName}`.toLowerCase() + Math.floor(1000 + Math.random() * 9000) })


    const { data: friendTable, error: friendError } = await supabase
      .from('friends')
      .insert({ user_id: uniqueID, friends: [], friend_requests: [] })


    if (signUp) {

      toast({
        title: "Confirm your email.",
        description: "We sent you an email, please go ahead and confirm it.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      return signUp;
    }
    return error;
  };

  // Signing out user
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return error;
    }
    return "Signed out";
  };

  return (
    <VStack border="1px solid" p="3.5rem" w="32.5rem" borderColor="gray.700">
      {!user ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="0.05rem" w="full">
            <Heading fontSize="lg" pb="1rem">
              Sign Up
            </Heading>
            <HStack>
              <Input
                type="text"
                {...register("firstName", { required: true })}
                placeholder="First Name"
                rounded="none"
                variant="outline"
              />
              <Input
                type="text"
                {...register("lastName", { required: true })}
                placeholder="Last Name"
                rounded="none"
                variant="outline"
              />
            </HStack>
            <Input
              type="email"
              {...register("email", { required: true })}
              placeholder="Email"
              rounded="none"
              variant="outline"
            />
            <Input
              type="password"
              {...register("password", { required: true })}
              placeholder="Password"
              rounded="none"
              variant="outline"
            />
            <Button
              type="submit"
              _hover={{ cursor: "pointer" }}
              rounded="none"
              variant="outline"
            >
              Create Account
            </Button>
          </VStack>
        </form>
      ) : (
        <HStack>
          <Button onClick={() => router.push("/profile")} variant="outline" rounded="none" w="full">
            Profile
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default SignUp;
