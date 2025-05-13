# Express Chat Application

A real-time chat application built with Express.js, Sequelize ORM, and SQLite. This application allows users to register, login, send messages, edit their own messages, delete messages, and search through message history.

## Features

- **User Authentication**
  - Secure registration and login system
  - Password hashing with bcrypt
  - Session management with express-session
  - Multi-tab session validation

- **Real-time Chat**
  - Periodic polling for message updates
  - Send, edit, and delete messages
  - Message search functionality
  - Visual indicators for edited messages

- **Security**
  - Input validation and sanitization
  - Protection against XSS attacks
  - Authenticated routes
  - User-specific message controls

- **Responsive Design**
  - Bootstrap-based UI
  - Mobile-friendly interface

## Technology Stack

- **Backend**
  - Node.js
  - Express.js
  - Sequelize ORM
  - SQLite database
  - express-session for session management
  - bcrypt for password hashing

- **Frontend**
  - EJS templating
  - Bootstrap 5
  - Vanilla JavaScript
  - Bootstrap Icons

## Project Structure

```
project/
├── controllers/         # Route handlers and business logic
│   ├── messageHandler.js
│   ├── restAPI.js
│   └── validationController.js
├── models/              # Database models and configuration
│   ├── index.js
│   ├── message.js
│   └── user.js
├── public/              # Static files
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
├── routes/              # Express routes
│   ├── api.js
│   ├── chatroom.js
│   ├── error.js
│   ├── login.js
│   └── signup.js
├── views/               # EJS templates
│   ├── includes/
│   ├── chatroom.ejs
│   ├── error.ejs
│   ├── login.ejs
│   └── signup.ejs
├── app.js               # Main application setup
└── database.sqlite3     # SQLite database file
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/benjaminrosin/chatroom.git
   cd chatroom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Access the application at:
   ```
   http://localhost:3000
   ```

## Application Flow

1. **Registration**
   - Enter email, first name, and last name
   - Set password (min 3 characters, alphanumeric)
   - System validates user information
   - Registration data stored in cookies temporarily for the two-step process

2. **Login**
   - Login with email and password
   - Access chat interface after successful authentication

3. **Chat Interface**
   - Send messages to all users
   - Edit or delete your own messages
   - Search through message history
   - Automatic polling for new messages every 10 seconds

## API Endpoints

### Authentication
- `GET /login` - Display login page
- `POST /login` - Process login request
- `GET /signup` - Display signup page (step 1)
- `POST /signup/password` - Process signup step 1
- `POST /signup` - Complete registration (step 2)
- `GET /logout` - Logout user

### Chat
- `GET /chatroom` - Access main chat interface
- `POST /api/add` - Add new message
- `POST /api/search` - Search messages
- `POST /api/edit` - Edit existing message
- `DELETE /api/delete` - Delete message (soft delete)
- `POST /api/update` - Poll for new messages

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt before storage
   - Minimum password requirements enforced

2. **XSS Prevention**
   - HTML content sanitization for all messages
   - Automatic encoding of special characters

3. **Session Management**
   - Secure session cookies
   - Session expiration after 1 hour
   - Prevention of multiple simultaneous logins from different browsers

## Database Schema

### User Table
- `id` - Primary key
- `email` - Unique email address
- `firstName` - User's first name
- `lastName` - User's last name
- `password` - Hashed password
- `createdAt` - Account creation timestamp
- `updatedAt` - Account update timestamp

### Message Table
- `id` - Primary key
- `content` - Message content
- `deleted` - Soft delete flag
- `user_id` - Foreign key to User
- `createdAt` - Message creation timestamp
- `updatedAt` - Message update timestamp

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Bootstrap for the responsive UI components
- Express.js team for the powerful web framework
- Sequelize team for the excellent ORM


## submitting
- **Benjamin Rosin-** benjaminro@edu.hac.ac.il
- **Yochai Benita-** yochaiben@edu.hac.ac.il
<!---
On our chat, all operations (adding, editing, deletion, etc.) are performed through precise surgical actions rather
than by deleting and re-displaying all messages

<h3>submitting </h3>
<b>Benjamin Rosin-</b> benjaminro@edu.hac.ac.il<br>
<b>Yochai Benita-</b> yochaiben@edu.hac.ac.il
