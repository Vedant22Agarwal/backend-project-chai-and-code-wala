import { Router } from 'express';
import { healthcare } from "../controllers/healthcheck.controller.js"

const router = Router();

router.route('/').get(healthcare);

export default router

