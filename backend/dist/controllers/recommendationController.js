"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// @desc    Get AI recommendations based on user history/categories
// @route   POST /api/recommendations
// @access  Public (optional body config)
const getRecommendations = async (req, res) => {
    try {
        const { recentCategories } = req.body;
        // This is a placeholder for actual LLM or ML-based logic.
        // In a real scenario, we might call OpenAI APIs here passing the user history.
        console.log(`Mock AI Recommendation generating for categories: ${recentCategories}`);
        let recommendations;
        if (recentCategories && recentCategories.length > 0) {
            // Find products matching the recent categories, limit to 5
            recommendations = await Product_1.default.find({ category: { $in: recentCategories } })
                .sort({ createdAt: -1 })
                .limit(5);
        }
        else {
            // Fallback: Recommend latest products
            recommendations = await Product_1.default.find({}).sort({ createdAt: -1 }).limit(5);
        }
        res.json({
            source: 'mock-ai-engine',
            status: 'success',
            data: recommendations
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getRecommendations = getRecommendations;
