import express from 'express';
import { getRecommendations } from '../controllers/recommendationController';

const router = express.Router();

router.post('/', getRecommendations);

export default router;
