import bcrypt from 'bcrypt';
import { getUserByEmail, createUser } from '../models/userModel.js';
import { generateToken, maxAge } from '../middlewares/middleware.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    const password_hash = await bcrypt.hash(password, 10);
    const result = await createUser({ name, email, password_hash });
    console.log(result);
    res.status(201).json({ message: "User registered successfully" });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
        id: user.id,
        is_admin: user.is_admin
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: maxAge * 1000
    });

    res.json({user: {
        id: user.id,
        is_admin: user.is_admin}
     });
};

export const logout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: "Logged out" });
};
