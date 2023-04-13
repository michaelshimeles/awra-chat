import Layout from "@/components/Layout/Layout";
import TodoListForm from "@/components/Todo/TodoListForm";
import TodoListView from "@/components/Todo/TodoListView";
import React from "react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import Protected from "@/components/Protected/Protected";

interface todoProps {
  user: any;
}

const todo: React.FC<todoProps> = ({ user }) => {
  if (!user) return <Protected />;
  return (
    <Layout>
      <TodoListForm />
      <TodoListView />
    </Layout>
  );
};

export default todo;

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
        user: null,
      },
    };

  // Run queries with RLS on the server
  const { data } = await supabase.from("users").select("*");

  return {
    props: {
      initialSession: session,
      user: session.user,
      data: data ?? [],
    },
  };
};
