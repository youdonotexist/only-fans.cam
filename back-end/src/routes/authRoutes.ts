import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const INVITE_CODE = process.env.INVITE_CODE || 'ONLYFANS2025';

// User interface for database results
interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    bio?: string;
    profile_image?: string;
    created_at: string;
    updated_at: string;
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    [
        // Validation middleware
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('inviteCode').notEmpty().withMessage('Invite code is required'),
    ],
    async (req: Request, res: Response) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, inviteCode } = req.body;
        const db = getDatabase();

        // Validate invite code
        if (inviteCode !== INVITE_CODE) {
            return res.status(400).json({ message: 'Invalid invite code' });
        }

        try {
            // Check if user already exists
            db.get(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username],
                async (err: Error | null, user: User | undefined) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    if (user) {
                        return res
                            .status(400)
                            .json({ message: 'User already exists' });
                    }

                    // Hash password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    // Create user with default profile
                    db.run(
                        'INSERT INTO users (username, email, password, bio, profile_image) VALUES (?, ?, ?, ?, ?)',
                        [username, email, hashedPassword, 'Hello, I am new to OnlyFans!', null],
                        function (this: { lastID: number }, err: Error | null) {
                            if (err) {
                                console.error(err.message);
                                return res.status(500).json({ message: 'Server error' });
                            }

                            // Create JWT token
                            const payload = {
                                user: {
                                    id: this.lastID,
                                },
                            };

                            jwt.sign(
                                payload,
                                JWT_SECRET,
                                { expiresIn: '1d' },
                                (err: Error | null, token: string | undefined) => {
                                    if (err) throw err;
                                    res.json({ token });
                                }
                            );
                        }
                    );
                }
            );
        } catch (err: unknown) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
    '/login',
    [
        // Validation middleware
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').exists().withMessage('Password is required'),
    ],
    async (req: Request, res: Response) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const db = getDatabase();

        try {
            // Check if user exists
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err: Error | null, user: User | undefined) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    if (!user) {
                        return res
                            .status(400)
                            .json({ message: 'Invalid credentials' });
                    }

                    // Verify password
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        return res
                            .status(400)
                            .json({ message: 'Invalid credentials' });
                    }

                    // Check if user has profile fields, update if missing
                    if (user.bio === null || user.bio === undefined) {
                        db.run(
                            'UPDATE users SET bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                            ['Hello, I am new to OnlyFans!', user.id],
                            (updateErr) => {
                                if (updateErr) {
                                    console.error('Error updating user profile:', updateErr.message);
                                }
                            }
                        );
                    }

                    // Create JWT token
                    const payload = {
                        user: {
                            id: user.id,
                        },
                    };

                    jwt.sign(
                        payload,
                        JWT_SECRET,
                        { expiresIn: '1d' },
                        (err: Error | null, token: string | undefined) => {
                            if (err) throw err;
                            res.json({ token });
                        }
                    );
                }
            );
        } catch (err: unknown) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export const authRoutes = router;
