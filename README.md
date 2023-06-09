# DevCamper API

> Backend API for DevCamper application, which is a Bootcamp directory website.

## Usage

Rename "config/config.env.env" to "config/config.env" and update the values/settings to your own.

## Install Dependencies

```
npm install
```

## Run App

```
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```
# Destroy all data
node seeder -d

# Import all data
node seeder -i
```

## Demo

The API is live at [sunny8080-dev-camper-api.onrender.com](https://sunny8080-dev-camper-api.onrender.com/)

Extensive documentation with examples [here](https://documenter.getpostman.com/view/19721099/2s93eU1tti)

- Version: 1.0.0
- License: Sunny8080
- Author: Sunny Kumar
