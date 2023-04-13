import { DeleteIcon } from "@chakra-ui/icons";
import { Button, Checkbox, HStack, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface TodoListViewProps {}

const TodoListView: React.FC<TodoListViewProps> = ({}) => {
  const [showToDo, setShowTodo] = useState<any>(null);
  const [checkedItem, setCheckedItem] = useState<any>(null);
  const [deletedItem, setDeletedItem] = useState<any>(null);

  useEffect(() => {
    viewTodoList();
  }, [checkedItem, deletedItem]);

  const viewTodoList = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/todo/show`);
      const todoList = await res.json();
      setShowTodo(todoList);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheck = async (id: string, task: string, completed: boolean) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/todo/change/`, {
        id,
        task,
        completed,
      });

      setCheckedItem({
        id,
        task,
        completed,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/todo/remove/`,
        {
          id,
        }
      );

      setDeletedItem(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <VStack pt="5rem">
      {showToDo
        ?.sort((a: any, b: any) =>
          a.completed === b.completed ? 0 : a.completed ? 1 : -1
        )
        ?.map((item: any) => {
          return (
            <VStack
              p="1rem"
              border="1px solid"
              borderColor="gray.700"
              w="15rem"
              key={item?.id}
            >
              <HStack justify="space-between" w="100%">
                <HStack justify="space-between" w="100%">
                  {item?.completed === true ? (
                    <Text as="s">{item?.task}</Text>
                  ) : (
                    <Text>{item?.task}</Text>
                  )}
                  ;
                  {item?.completed ? (
                    <Checkbox
                      onChange={(e) =>
                        handleCheck(item?.id, item?.task, e.target.checked)
                      }
                      defaultChecked
                    />
                  ) : (
                    <Checkbox
                      onChange={(e) =>
                        handleCheck(item?.id, item?.task, e.target.checked)
                      }
                    />
                  )}
                </HStack>
                <Button
                  size="sm"
                  leftIcon={<DeleteIcon />}
                  variant="ghost"
                  p="0rem"
                  _hover={{ bgColor: "none" }}
                  onClick={() => handleDelete(item?.id)}
                />
              </HStack>
            </VStack>
          );
        })}
    </VStack>
  );
};

export default TodoListView;
