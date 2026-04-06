import { Router } from 'express';
import { articleController } from '../controllers/articleController';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/generate', articleController.generate);
router.get('/', articleController.list);
router.get('/:id', articleController.getById);
router.post('/', articleController.create);
router.put('/:id', articleController.update);
router.delete('/:id', articleController.remove);
router.post('/:id/cover', uploadMiddleware.single('cover'), articleController.uploadCover);

export default router;
