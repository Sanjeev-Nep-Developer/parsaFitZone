import { Router } from 'express';
import {
  dashboard, listExpiring, listExpired,
  getAddMember, postAddMember,
  getEditMember, postEditMember,
  postDeleteMember, postExtendExpired,
  stats
} from '../controllers/memberController.js';

const router = Router();

router.get('/dashboard', dashboard);
router.get('/lists/expiring', listExpiring);
router.get('/lists/expired', listExpired);

router.get('/add', getAddMember);
router.post('/add', postAddMember);

router.get('/:id/edit', getEditMember);
router.post('/:id/edit', postEditMember);
router.post('/:id/delete', postDeleteMember);

// extend expired
router.post('/:id/extend', postExtendExpired);

// stats api
router.get('/api/stats', stats);

export default router;
