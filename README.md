# Jason Chen Blog

A personal blog built with Next.js, featuring a responsive video hero section, admin panel, and SQLite database.

## Features

- Full-screen video hero with scroll effect
- Blog posts with comments
- Admin panel to manage users and content 
- Authentication with NextAuth.js
- SQLite database with Prisma

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database:
   ```bash
   npx prisma db push
   node create-admin.js
   ```
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the application:
   ```bash
   npm start
   ```

For an easier setup, you can use the provided scripts:
```bash
./fix-build.sh    # Clean install and build
./start-nextjs.sh # Start the application
```

## Video Hero Section

The homepage features a full-screen video that shrinks as the user scrolls down. To replace the placeholder with your own video:

1. Add your own MP4 video file to the `public` folder and name it `placeholder.mp4`

Or use the provided video generator:

1. Open `http://localhost:3000/createPlaceholderVideo.html` in your browser
2. Click "Generate Placeholder Video" to create a sample video
3. Move the downloaded file to the `public` folder and rename it to `placeholder.mp4`

## Admin Access

- Admin User: admin@jasonchen.com / Password: admin123
- Super User: super@jasonchen.com / Password: super123

## Need Help?

If you need assistance with specific features or encounter issues, please refer to the documentation in the `docs` folder or contact Jason Chen directly.
