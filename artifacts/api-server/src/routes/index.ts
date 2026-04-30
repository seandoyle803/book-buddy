import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import profileRouter from "./profile";
import booksRouter from "./books";
import sessionsRouter from "./sessions";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(profileRouter);
router.use(booksRouter);
router.use(sessionsRouter);

export default router;
