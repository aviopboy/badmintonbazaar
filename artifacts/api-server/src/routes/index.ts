import { Router } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import usersRouter from "./users";
import productsRouter from "./products";
import settingsRouter from "./settings";

const router = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(productsRouter);
router.use(settingsRouter);

export default router;
