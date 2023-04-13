import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";

interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
  };

  return (
    <VStack border="1px solid" p="3.5rem" w="32.5rem" borderColor="gray.700">
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
    </VStack>
  );
};

export default Login;
