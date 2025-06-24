# 🌟 Astrology Insights

A modern, full-stack astrology content management platform built with React, TypeScript, Express, and PostgreSQL. Features real-time horoscopes, crystal healing guides, and spiritual content in Georgian language.

## ✨ Features

### 🔮 Core Features
- **Daily Horoscopes** - Personalized zodiac predictions
- **Crystal Healing Guides** - Comprehensive crystal properties and uses
- **Moon Phase Tracking** - Lunar calendar and influences
- **Spiritual Articles** - Meditation, chakras, and energy work
- **Georgian Language Support** - Native Georgian content

### 🛡️ Security & Performance
- **JWT Authentication** - Secure user sessions
- **Role-based Access Control** - Admin, Editor, Reader permissions
- **Rate Limiting** - API protection against abuse
- **Input Sanitization** - XSS and injection prevention
- **CORS Protection** - Cross-origin request security
- **Security Headers** - Full security header implementation

### 🏗️ Technical Features
- **PostgreSQL Database** - Production-ready data persistence
- **RESTful API** - Clean, documented API endpoints
- **Error Handling** - Comprehensive error management
- **Request Logging** - Detailed request/response logging
- **Database Migrations** - Schema version control
- **Input Validation** - Zod schema validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AstrologyInsights
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://mnatobidb_owner:npg_7StpReyO9mqE@ep-royal-queen-a98tz0z5-pooler.gwc.azure.neon.tech/mnatobidb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-session-secret-change-in-production-min-32-chars
ADMIN_EMAIL=admin@astrologyinsights.ge
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:5000/api

## 🔑 Authentication

The application includes a complete authentication system:

### Default Users
- **Admin**: username: `admin`, password: `admin123`
- **Editor**: username: `editor`, password: `editor123`

### API Authentication
Use JWT tokens for API access:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/admin/users
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Article Endpoints
- `GET /api/articles` - Get articles (with pagination)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:id` - Update article (auth required)
- `DELETE /api/articles/:id` - Delete article (admin only)
- `GET /api/articles/search/:query` - Search articles
- `GET /api/articles/popular` - Get popular articles

### Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:name` - Get category by name

### Horoscope Endpoints
- `GET /api/horoscopes/:zodiacSign` - Get daily horoscope

### Admin Endpoints
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Create user (admin only)

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality components
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing

### Backend Stack
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens
- **Zod** - Input validation

### Database Schema
```sql
-- Articles table
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  author_role TEXT,
  image_url TEXT,
  published_at TIMESTAMP,
  featured BOOLEAN,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  name_georgian TEXT,
  description TEXT,
  color TEXT
);

-- Horoscopes table
CREATE TABLE horoscopes (
  id SERIAL PRIMARY KEY,
  zodiac_sign TEXT NOT NULL,
  zodiac_sign_georgian TEXT,
  content TEXT NOT NULL,
  date DATE NOT NULL
);
```

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Editor, Reader)
- Secure password handling
- Session management

### API Security
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input sanitization (XSS prevention)
- SQL injection prevention via ORM
- Security headers (CSP, HSTS, etc.)

### Data Protection
- Environment variable validation
- Sensitive data exclusion from logs
- Error message sanitization
- Request/response logging

## 🚀 Deployment

### Environment Variables (Production)
```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-strong-jwt-secret-min-32-characters
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-strong-session-secret-min-32-characters
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong-admin-password
FRONTEND_URL=https://yourdomain.com
```

### Build for Production
```bash
npm run build
npm start
```

## 📖 Development

### Database Operations
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed
```

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@astrologyinsights.ge
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- Design inspiration from modern astrology platforms
- Georgian cultural content and traditions
- Open source community contributions
- Neon Database for reliable PostgreSQL hosting

---

**Made with ❤️ for the Georgian astrology community** 