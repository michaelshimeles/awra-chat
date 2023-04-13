import { Button, HStack, Heading, Input, VStack } from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";

interface SignUpProps {}

const SignUp: React.FC<SignUpProps> = ({}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data: any) => {};

  return (
    <VStack border="1px solid" p="3.5rem" w="32.5rem" borderColor="gray.700">
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
    </VStack>
  );
};

export default SignUp;
