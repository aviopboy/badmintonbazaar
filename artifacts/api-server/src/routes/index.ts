import { Router } from "express";
import healthRouter from "./health.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";

const router = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(usersRouter);

export default router;
