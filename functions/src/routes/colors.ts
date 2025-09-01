import express from 'express';
import { ColorService } from '../services/ColorService';

const router = express.Router();
const colorService = new ColorService();

// 색상 팔레트 조회 (색상 코드와 이름을 함께 반환)
router.get('/palette', async (req, res) => {
  try {
    const colorsWithNames = colorService.getColorWithNames();
    res.json({
      success: true,
      data: colorsWithNames,
      message: '색상 팔레트 조회 성공'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    res.status(500).json({
      success: false,
      data: null,
      message: '색상 팔레트 조회 실패',
      error: errorMessage
    });
  }
});

export default router;
