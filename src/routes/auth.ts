import { Hono } from "hono";
import { login, register } from "../controllers/authController";
import { validateLogin, validateRegister } from "../validations/authValidation";

const auth = new Hono();

auth.post("/register", validateRegister, register);
auth.post("/login", validateLogin, login);

export default auth;
