// Import the express in typescript file
import express from 'express';


//import { registerUser, validateUserRegister, listUsers } from './routes/userRoutes'
import userRoutes from './routes/userRoutes'
import taskRoutes from './routes/taskRoutes'
import rewardRoutes from './routes/rewardRoutes'
import { userTable, taskTable, rewardTable } from './db/sqlite3/db'
import { User } from './models/userModel'

import session from 'express-session'
import path from 'path'

userTable.migrate();
taskTable.migrate();
rewardTable.migrate();

// Initialize the express engine
const app: express.Application = express();
app.use(express.json());

app.use(session({
  secret: 'super secret', // TODO: change to use env variable
  resave: false,
  saveUninitialized: true
}));

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}
app.use(express.static(path.join(__dirname, "../public")));
// Handling '/' Request
app.get('/', (_req, res) => {
    res.send("root directory xd");
});

//app.post('/api/register', validateUserRegister, registerUser );
//app.get('/api/users', listUsers);
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/rewards', rewardRoutes);

export default app;

