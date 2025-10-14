// Import the express in typescript file
import express from 'express';
import 'dotenv/config'


import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import taskRoutes from './routes/taskRoutes'
import rewardRoutes from './routes/rewardRoutes'
import frontendRoutes from './routes/frontendRoutes'

import { userTable, taskTable, rewardTable, transactionTable, db } from './db/sqlite3/db'
import { User } from './models/userModel'

import session from 'express-session'

import path from 'path';

// Tell 'express-session' to store user data in the cookie itself
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}
import { BetterSQliteSessionStore } from './db/sqlite3/sessionStore'


// Initialize database tables if they don't already exist
userTable.migrate();
taskTable.migrate();
rewardTable.migrate();
transactionTable.migrate();

// Initialize the express engine
const app: express.Application = express();
app.use(express.json());

app.use(session({
    store: new BetterSQliteSessionStore({
        client: db,
    }),
    secret: process.env.GRAVELLER_SESSION_SECRET || 'secret', 
    resave: false,
    saveUninitialized: true,
}));


// Serve frontend resources statically
app.use(express.static(path.join(__dirname, "./public")));


// Use all routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/', frontendRoutes);

export default app;

