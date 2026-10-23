import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { LoginSchema } from '../types.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid login payload', details: parsed.error.format() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
    },
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({ success: true, user });
});

// GET /api/auth/bootstrap (Returns pre-configured demo roles for rapid switching)
router.get('/bootstrap', async (req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      department: true,
    },
    orderBy: { role: 'asc' },
  });

  res.json({
    success: true,
    accounts: users.map((u) => ({
      ...u,
      defaultPasswordHint: u.role === 'ADMINISTRATOR' ? 'Admin@AECC2026!' : u.role === 'EMERGENCY_OPERATOR' ? 'Operator@AECC2026!' : 'Observer@AECC2026!',
    })),
  });
});

export default router;
