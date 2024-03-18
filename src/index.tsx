import { Hono } from "hono";
import { renderer } from "./renderer";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { csrf } from "hono/csrf";

type Bindings = {
  shorten_me_kv: KVNamespace;
};

const app = new Hono<{
  Bindings: Bindings;
}>();

app.use(renderer);

const schema = z.object({
  url: z.string().url(),
});
const validator = zValidator("form", schema, (result, c) => {
  if (!result.success) {
    return c.render(
      <div>
        <h2>Error!</h2>
        <a href="/">Back to top</a>
      </div>
    );
  }
});

const createKey = async (kv: KVNamespace, url: string): Promise<string> => {
  const uuid = crypto.randomUUID();
  const key = uuid.substring(0, 6);
  const result = await kv.get(key);
  if (!result) {
    await kv.put(key, url);
  } else {
    return await createKey(kv, url);
  }
  return key;
};

app.get("/", (c) => {
  return c.render(
    <div>
      <h2>Create shorten URL!</h2>
      <form action="/create" method="post">
        <input
          type="text"
          name="url"
          autocomplete="off"
          style={{
            width: "80%",
          }}
        />
        &nbsp;
        <button type="submit">Create</button>
      </form>
    </div>
  );
});

app.post("/create", csrf(), validator, async (c) => {
  const { url } = c.req.valid("form");
  const key = await createKey(c.env.shorten_me_kv, url);

  const shortenUrl = new URL(`/${key}`, c.req.url);

  return c.render(
    <div>
      <h2>Created!</h2>
      <input
        type="text"
        value={shortenUrl.toString()}
        style={{
          width: "80%",
        }}
        autofocus
      />
    </div>
  );
});

app.get("/:key{[0-9a-z]{6}}", async (c) => {
  const key = c.req.param("key");
  const url = await c.env.shorten_me_kv.get(key);

  if (url === null) {
    return c.redirect("/");
  }

  return c.redirect(url);
});

export default app;
