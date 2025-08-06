# OnlyFans - A Platform for Fan Enthusiasts

OnlyFans is a social media platform dedicated to fans of all types - ceiling fans, desk fans, industrial fans, and more! Share your favorite fans, follow other enthusiasts, and engage with a community that shares your passion.

## Tech Stack

### Frontend
- **Framework**: React 19.0.0
- **Routing**: React Router 7.3.0
- **UI Components**: React Icons 5.5.0
- **Styling**: CSS Modules
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **Validation**: express-validator
- **File Upload**: multer
- **CORS Handling**: cors

### Database
- **Database**: SQLite3
- **Backup/Replication**: Litestream (S3-compatible storage)

### Storage
- **Image Storage**: AWS S3 for user uploads
- **Fallback**: UI Avatars API for placeholder images

### Deployment
- **Frontend**: Netlify
- **Backend**: Render (Docker container)
- **Database**: SQLite with Litestream replication to S3

## Application Features

- **User Authentication**: Register and login with JWT-based authentication
- **Profile Management**: Create and edit user profiles with avatars and cover images
- **Fan Posts**: Share photos and descriptions of your favorite fans
- **Social Interactions**: Like, comment, and share fan posts
- **Follow System**: Follow other users to see their content
- **Messaging**: Private messaging between users
- **Notifications**: Real-time notifications for social interactions
- **Mobile Responsive**: Fully responsive design for all device sizes

## How It Works

1. **User Registration/Login**: Users can register with a username, email, and password. An invite code is required for registration.
2. **Creating Fan Posts**: Authenticated users can create posts about their favorite fans, including images and descriptions.
3. **Social Interactions**: Users can like, comment on, and share fan posts from other users.
4. **Following Users**: Users can follow other fan enthusiasts to see their content in their feed.
5. **Messaging**: Users can send private messages to other users.
6. **Notifications**: Users receive notifications when someone likes, comments on, or shares their posts.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onlyfans
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd front-end
   npm install
   
   # Install backend dependencies
   cd ../back-end
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `back-end` directory:
   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_jwt_secret_change_in_production
   FRONTEND_URL=http://localhost:3001
   
   # Optional: AWS S3 Configuration for image uploads
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```
   
   Create a `.env` file in the `front-end` directory:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. **Start the development servers**
   
   Start the backend server:
   ```bash
   cd back-end
   npm run dev
   ```
   
   Start the frontend server in a new terminal:
   ```bash
   cd front-end
   npm start
   ```

5. **Access the application**
   
   The frontend will be available at http://localhost:3001
   The backend API will be available at http://localhost:3000/api

## Deployment

The application can be deployed using the provided deployment scripts in the `deployment` directory.

### Deployment Architecture
- **Frontend**: Deployed to Netlify
- **Backend**: Deployed to Render as a Docker container
- **Database**: SQLite with Litestream replication to S3

### Deployment Steps

1. **Deploy all components**
   ```bash
   cd deployment
   chmod +x deploy.sh
   ./deploy.sh --all
   ```

2. **Deploy specific components**
   ```bash
   # Deploy only the frontend
   ./deploy.sh --frontend
   
   # Deploy only the backend
   ./deploy.sh --backend
   
   # Deploy only the database
   ./deploy.sh --database
   ```

For detailed deployment instructions, refer to the [Deployment Guide](./deployment/README.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [Litestream](https://litestream.io/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)