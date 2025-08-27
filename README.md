# America's Trusted Businesses 🇺🇸

A comprehensive Next.js web application for discovering and managing trusted businesses across America. Features user authentication, business directory, review system, and comprehensive admin panel.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=flat-square&logo=microsoft-sql-server)

## ✨ Features

### 🔐 User Management
- **User Authentication**: Secure login/signup with NextAuth.js
- **Profile Management**: Complete profile editing with password changes
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Persistent user sessions

### 🏢 Business Directory
- **Business Listings**: Comprehensive business database
- **Search & Filter**: Advanced search by name, industry, location
- **Business Details**: Contact info, addresses, ratings, reviews
- **Industry Categories**: Organized by business sectors
- **Responsive Maps**: Interactive business location mapping

### ⭐ Review System
- **User Reviews**: Customers can rate and review businesses
- **Review Management**: Admin moderation of reviews
- **Rating Display**: Star ratings and review summaries
- **Review Analytics**: Comprehensive review statistics

### 🛠️ Admin Panel
- **Dashboard**: Overview with key metrics and analytics
- **Business Management**: Full CRUD operations for businesses
- **User Management**: Admin role assignment and user oversight
- **Review Moderation**: Approve, reject, and manage reviews
- **Analytics**: Detailed reporting and business insights
- **Settings**: System configuration and preferences

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Fast Loading**: Optimized performance with Next.js
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Accessibility**: WCAG compliant design patterns
- **Toast Notifications**: Real-time user feedback

## 🚀 Tech Stack

### Frontend
- **Next.js 14.2** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Hook Form** - Form state management
- **React Hot Toast** - Notification system

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js 4.24** - Authentication solution
- **SQL Server** - Primary database
- **bcryptjs** - Password hashing
- **mssql** - SQL Server driver

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQL Server instance
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CachoMX/americastrustesbusinesses.git
   cd americastrustesbusinesses
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env.local` with your configuration:
   ```env
   # Database Configuration
   DB_SERVER=your_sql_server_host
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_PORT=1433

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google Maps (Optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

   # Admin Configuration
   ADMIN_EMAIL=admin@yourdomain.com
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

### Core Tables
- **`UsersWebsite`** - User accounts and authentication
- **`Businesses`** - Business listings and information  
- **`Reviews`** - User reviews and ratings
- **`Industries`** - Business category classifications

### Key Relationships
- Users can create multiple reviews
- Businesses belong to industries
- Reviews are linked to both users and businesses
- Admin users have elevated permissions

## 🗂️ Project Structure

```
americas-trusted-businesses/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── businesses/        # Business directory
│   ├── browse/            # Browse page
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   └── ui/               # General UI components
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── types/                # TypeScript definitions
└── middleware.ts         # Route middleware
```

## 🔑 Key Pages & Routes

### Public Routes
- `/` - Homepage with featured businesses
- `/browse` - Browse businesses by category
- `/businesses` - Search and filter businesses
- `/businesses/[id]` - Individual business pages
- `/auth/signin` - User login
- `/auth/signup` - User registration

### Protected Routes
- `/profile` - User profile management
- `/admin/*` - Admin panel (admin users only)

### API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/businesses` - Business CRUD operations
- `/api/profile` - Profile management
- `/api/admin/*` - Admin-only endpoints
- `/api/reviews` - Review system

## 🛡️ Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in NextAuth.js protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access**: Admin and user role separation
- **Environment Variables**: Secure configuration management

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark/Light Mode**: User preference support
- **Loading States**: Smooth user experience
- **Error Handling**: Graceful error messages
- **Form Validation**: Real-time input validation
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized images and lazy loading

## 📈 Admin Dashboard

The admin panel provides comprehensive management tools:

- **📊 Analytics Dashboard**: Key metrics and insights
- **🏢 Business Management**: Add, edit, delete businesses
- **👥 User Management**: Role assignment and user oversight
- **⭐ Review Moderation**: Approve and manage reviews
- **⚙️ System Settings**: Configuration management
- **📱 Responsive Admin UI**: Mobile-friendly admin interface

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variables in Vercel**
   
   You need to add these environment variables in your Vercel dashboard:
   ```bash
   # Database Configuration
   DB_SERVER=your_sql_server_host
   DB_NAME=your_database_name  
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_PORT=1433

   # NextAuth Configuration
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secure_secret_key

   # Optional
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ADMIN_EMAIL=admin@yourdomain.com
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables Setup

For production deployment, ensure all environment variables are properly configured:

- **Database**: Use your production SQL Server credentials
- **NextAuth**: Generate a secure secret with `openssl rand -base64 32`
- **URL**: Set `NEXTAUTH_URL` to your production domain

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify SQL Server is running
   - Check connection string in `.env.local`
   - Ensure database exists and user has permissions

2. **Authentication Problems**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Clear browser cookies and try again

3. **Build Errors**
   - Run `npm run typecheck` to identify TypeScript issues
   - Ensure all environment variables are set
   - Clear `.next` folder and rebuild

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database integration with [SQL Server](https://www.microsoft.com/sql-server)

---

**America's Trusted Businesses** - Connecting customers with verified, trusted businesses across America 🇺🇸

For support or questions, please open an issue on GitHub.