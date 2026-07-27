import { Router } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import usersRouter from "./users";

const router = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(usersRouter);

export default router;
