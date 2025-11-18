# Cold Mail Backend

An email automation system that reads recipient data from CSV files, checks for duplicates using a database, and sends scheduled emails via Nodemailer.

## Deployment to Render

To deploy this application to Render:

1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New+" and select "Web Service"
4. Connect your GitHub repository
5. Configure the following settings:
   - Name: coldmail-backend
   - Region: Choose the region closest to you
   - Branch: main
   - Root Directory: Leave empty
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `EMAIL_HOST`: Your SMTP host
   - `EMAIL_PORT`: Your SMTP port
   - `EMAIL_USER`: Your email username
   - `EMAIL_PASS`: Your email password
   - `EMAIL_FROM`: Your sender email address
   - `DAILY_EMAIL_LIMIT`: Daily email limit (default: 400)
   - `TIME_WINDOW_START_1`: First time window start (default: 10)
   - `TIME_WINDOW_END_1`: First time window end (default: 12)
   - `TIME_WINDOW_START_2`: Second time window start (default: 13)
   - `TIME_WINDOW_END_2`: Second time window end (default: 15)
   - `IS_DEVELOPMENT`: Set to `false` for production
7. Click "Create Web Service"

## Environment Variables

All environment variables can be configured in the Render dashboard:

- `MONGODB_URI`: MongoDB connection string
- `EMAIL_HOST`: SMTP server hostname
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `EMAIL_FROM`: Sender email address
- `DAILY_EMAIL_LIMIT`: Maximum emails to send per day
- `TIME_WINDOW_START_1`: First email sending window start hour (24-hour format)
- `TIME_WINDOW_END_1`: First email sending window end hour (24-hour format)
- `TIME_WINDOW_START_2`: Second email sending window start hour (24-hour format)
- `TIME_WINDOW_END_2`: Second email sending window end hour (24-hour format)
- `IS_DEVELOPMENT`: Set to `true` for development mode

## Endpoints

- `/health`: Health check endpoint
- `/stats`: View email statistics

## Note on Render Free Tier Limitations

The free tier on Render has some limitations that may affect this application:

1. The service goes to sleep after 15 minutes of inactivity
2. Limited to 512MB RAM
3. May experience cold starts

For a production email sending service, consider upgrading to a paid plan.