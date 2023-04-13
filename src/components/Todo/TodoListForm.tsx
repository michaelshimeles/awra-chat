import { Button, HStack, Heading, Input, Text, VStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

interface TodoListFormProps {}

const TodoListForm: React.FC<TodoListFormProps> = ({}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {}, []);

  const onSubmit = async (data: any) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/todo/add`, {
        method: "POST",
        body: data?.todo,
      });

      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <VStack pt="5rem">
      <VStack border="1px solid" p="3.5rem" w="32.5rem" borderColor="gray.700">
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap="0.05rem" w="25.4rem">
            <Heading fontSize="lg" pb="1rem">
              To-do List
            </Heading>
            <HStack>
              <Input
                type="text"
                placeholder="To-do"
                {...register("todo", { required: true })}
                rounded="none"
                variant="outline"
              />
              <Button
                type="submit"
                _hover={{ cursor: "pointer" }}
                rounded="none"
                variant="outline"
              >
                Submit
              </Button>
            </HStack>
            {errors.exampleRequired && <Text>This field is required</Text>}
          </VStack>
        </form>
      </VStack>
    </VStack>
  );
};

export default TodoListForm;
