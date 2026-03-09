import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get AI recommendations based on user history/categories
// @route   POST /api/recommendations
// @access  Public (optional body config)
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recentCategories } = req.body;

    // This is a placeholder for actual LLM or ML-based logic.
    // In a real scenario, we might call OpenAI APIs here passing the user history.
    console.log(`Mock AI Recommendation generating for categories: ${recentCategories}`);

    let recommendations;
    
    if (recentCategories && recentCategories.length > 0) {
      // Find products matching the recent categories, limit to 5
      recommendations = await Product.find({ category: { $in: recentCategories } })
                                     .sort({ createdAt: -1 })
                                     .limit(5);
    } else {
      // Fallback: Recommend latest products
      recommendations = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    }

    res.json({
        source: 'mock-ai-engine',
        status: 'success',
        data: recommendations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
