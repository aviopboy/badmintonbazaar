import { Router } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import usersRouter from "./users";
import productsRouter from "./products";

const router = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(productsRouter);

export default router;
