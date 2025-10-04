# Graveller

![graveller-dashboard](https://github.com/BurningApparatus/graveller-DLBCSPJWD01/blob/master/screenshots/dashboard_light.png?raw=true)

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

### Run in Development

1. Repeat steps 1-3 from previous section.
2. Run `npm run dev`
3. Visit the displayed URL


## Credit

The colours for the light and dark modes are taken from the [Rosepine Theme](rosepinetheme.com). 
