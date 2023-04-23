import { Button, HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface LoginProps { }

const Login: React.FC<LoginProps> = ({ }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Supabase client
  const supabase = useSupabaseClient();
  const router = useRouter()

  // user session
  const user = useUser();

  // Form submission
  const onSubmit = async (data: any) => {
    login(data);
  };

  // Checking login info with supabase
  const login = async (data: any) => {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: data?.email,
      password: data?.password,
    });

    if (loginData) {
      return loginData;
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
          <VStack gap="0.05rem" w="25.4rem">
            <Heading fontSize="lg" pb="1rem">
              Login
            </Heading>
            <Input
              type="email"
              placeContent="E-mail"
              {...register("email", { required: true })}
              rounded="none"
              variant="outline"
              w="100%"
            />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
              rounded="none"
              variant="outline"
            />
            <Button
              type="submit"
              _hover={{ cursor: "pointer" }}
              rounded="none"
              variant="outline"
            >
              Login
            </Button>
            {errors.exampleRequired && <Text>This field is required</Text>}
          </VStack>
        </form>
      ) : (
        <HStack>
          {/* <Button onClick={handleSignOut} variant="outline" rounded="none" w="full">
            Log out
          </Button> */}
          <Button onClick={() => router.push("/profile")} variant="outline" rounded="none" w="full">
            Profile
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default Login;

