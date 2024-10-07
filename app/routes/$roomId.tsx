import { useState } from "react";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const roomId = params.roomId;

  if (!roomId) {
    throw new Response("Not Found", { status: 404 });
  }

  const doId = context.cloudflare.env.DO.idFromName(roomId);
  const doStub = context.cloudflare.env.DO.get(doId);

  const messages = await doStub.getMessages();

  return json({
    messages,
  });
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const roomId = params.roomId;

  if (!roomId) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const user = formData.get("user");
  const message = formData.get("message");

  if (!user || !message) {
    throw new Response("Bad Request", { status: 400 });
  }

  const doId = context.cloudflare.env.DO.idFromName(roomId);
  const doStub = context.cloudflare.env.DO.get(doId);

  await doStub.postMessage(user, message);

  return json({
    success: true,
  });
};

export default function Room() {
  const { messages } = useLoaderData<typeof loader>();
  const [username, setUsername] = useState(() => {
    return "user" + Math.floor(Math.random() * 1000000);
  });

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <ul className="p-2">
        {messages.map((message) => (
          <li key={message.id}>
            {message.user}: {message.message}
          </li>
        ))}
      </ul>
      <Form method="POST" className="flex flex-row space-x-2 p-2">
        <input
          type="text"
          name="user"
          className="border p-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          name="message"
          className="border p-2 w-full"
          placeholder="Message..."
        />
        <button type="submit" className="border p-2">
          Send
        </button>
      </Form>
    </div>
  );
}
