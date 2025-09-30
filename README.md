# Graveller

## Introduction 

This is a project built for IU's Project: Java and Web Development (DLBCSPJWD01) course. It is a gameified productivity app meant to motivate completion of tasks by rewarding in-app currency, which may then be used to redeem rewards (All user defined!).

## Features

- Multi-user support with persistent session based login
- Creation of repeatable tasks with descriptions, due dates and completion values
- Creation of custom rewards with costs
- Tracking of statistics such as daily performance and amount of redemptions for each reward
- Light/Dark mode
- Reactive Design

## Installation

Requires nodejs 18 or higher.

### Run in Production

1. Clone the repository
2. cd into the root directory and run `npm install` to install dependencies
3. Clone the .env.example to .env (`cp .env.example .env`) and fill out the environment variables accordingly
4. run `npm run build` then `npm run start` 
5. Visit the displayed URL

## Test Cases

### User Authentication


#### Test 1 - Registration

- Visit the registration page (/register)
- Enter a valid username and password
- Click the "Register" button

**Expected Outcome:** User is registered and redirected to the /dashboard page with no associated user data

#### Test 2 - Unique username for registration

- Visit the registration page (/register)
- Enter the username for an existing account
- Click the "Register" button

**Expected Outcome:** Error text showing that the user already exists should display.

#### Test 3 - Successful Login

- Visit the login page (/login)
- Enter the username for an existing account
- Enter the password for that account
- Click the "Login" button

**Expected Outcome:** User is registered and redirected to the /dashboard page with previously saved user data.


#### Test 4 - Unsuccessful Login with invalid credentials

- Visit the login page (/login)
- Enter the username for an existing account
- Enter an incorrect password for that account
- Click the "Login" button

**Expected Outcome:** Error text notifying entry of incorrect credentials should display.

#### Test 5 - Log out

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the account button represented by the symbol in the top right
- On the modal dialogue, click the "Log out" button
- Visit the dashboard again (/dashboard)

**Expected Outcome:** User is redirected to the login screen 

#### Test 6 - User delete

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the account button represented by the symbol in the top right
- On the modal dialogue, click the "Delete account" button
- Visit the login screen (/login)
- Re-enter proper credentials for deleted user

**Expected Outcome:** Error text notifying entry of incorrect credentials should display.

### Tasks

#### Test 1 - Create task

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the plus button inside the task panel (either at the bottom or next to the Tasks header at the top)
- Enter task information with proper data types

**Expected Outcome:** Task is added to the task list, and is reflected on the Task Panel.

#### Test 2 - Create invalid Task

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the plus button inside the task panel (either at the bottom or next to the Tasks header at the top)
- In the "value" field, add any data which is not a positive integer
- Enter remaining task information 

**Expected Outcome:** User is notified of invalid task data

#### Test 3 - Mark task as complete

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the body of an uncompleted task

**Expected Outcome:** The task is marked as completed, brought to the bottom of the list and appears with a strikethrough, and the task's value is added to the user's balance.

#### Test 4 - Undo task completion

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the body of an completed task

**Expected Outcome:** The task is marked as uncompleted, brought to the top of the list and appears without a strikethrough, and the task's value is subtracted from the user's balance.

#### Test 5 - Refresh task

As a logged in user:

- Visit the dashboard (/dashboard)
- On a completed task, click the "refresh button" on the very right

**Expected Outcome:** The task is marked as uncompleted, brought to the top of the list and appears without a strikethrough, without affecting the user's balance.


#### Test 6 - Delete task

As a logged in user:

- Visit the dashboard (/dashboard)

**Expected Outcome:** The task is marked as deleted, and removed from the list. A notification should appear offering the chance to undo the action.


#### Test 7 - Undo delete task

As a logged in user:

- Visit the dashboard (/dashboard)
- On a task, click the delete button (button marked with X) on the right
- On the popup, click the "Undo" button

**Expected Outcome:** The task is initially deleted, but returns after the undo button is
pressed.


### Rewards

#### Test 1 - Create reward

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the plus button inside the reward panel (either at the bottom or next to the Rewards header at the top)
- Enter reward information with proper data types

**Expected Outcome:** Reward is added to the reward list, and is reflected on the Reward Panel.

#### Test 2 - Create invalid Reward

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the plus button inside the reward panel (either at the bottom or next to the Rewards header at the top)
- In the "value" field, add any data which is not a positive integer
- Enter remaining reward information 

**Expected Outcome:** User is notified of invalid reward data

#### Test 3 - Complete Reward

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the body of a reward while having a balance greater than the reward's cost

**Expected Outcome:** The reward's value is added to the user's balance and its completions (large number on the right) increases by one.

#### Test 4 - Unable to afford reward

As a logged in user:

- Visit the dashboard (/dashboard)
- Click the body of a reward while having a balance less than the reward's cost

**Expected Outcome:** A notification appears saying that user cannot afford reward.

#### Test 5 - Delete reward

As a logged in user:

- Visit the dashboard (/dashboard)
- On a task, click the delete button (button marked with X) on the right

**Expected Outcome:** The reward is marked as deleted, and removed from the list. A notification should appear offering the chance to undo the action.


#### Test 6 - Undo delete reward

As a logged in user:

- Visit the dashboard (/dashboard)
- On a task, click the delete button (button marked with X) on the right
- On the popup, click the "Undo" button

**Expected Outcome:** The reward is initially deleted, but returns after the undo button is pressed.


