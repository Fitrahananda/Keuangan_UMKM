import { Hono } from "hono";

const user = new Hono();

user.get("/profile", (c) => {
  return c.json({ message: "Profile route" });
});

export default user;
