# Prime Lux Events - Deployment Guide

## Overview

Prime Lux Events is a luxury event rental website built with Next.js 14, TypeScript, PostgreSQL, and Stripe integration. This guide covers local development setup, testing, and production deployment.

## Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 13 or higher
- npm 9.0 or higher
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd prime-lux-events
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/primelux_events"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="primelux_events"
DB_USER="username"
DB_PASSWORD="password"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Prime Lux Events <noreply@primeluxevents.com>"

# Company Information
COMPANY_NAME="Prime Lux Events"
COMPANY_ADDRESS="123 Business St, Shelton, CT 06484"
COMPANY_PHONE="(203) 555-0123"
COMPANY_EMAIL="info@primeluxevents.com"
```

### 3. Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE primelux_events;
CREATE USER primelux WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE primelux_events TO primelux;
```

2. Run database migrations:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

### Test Coverage Requirements

- Minimum 70% coverage for branches, functions, lines, and statements
- All components should have unit tests
- API routes should have integration tests
- Utility functions should have comprehensive tests

## Building for Production

### 1. Build Application

```bash
npm run build
```

### 2. Start Production Server

```bash
npm start
```

## Docker Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- **app**: Next.js application (port 3000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **nginx**: Reverse proxy (ports 80, 443)
- **pgadmin**: Database admin interface (port 5050)

### 2. Using Docker Only

```bash
# Build image
docker build -t prime-lux-events .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e STRIPE_SECRET_KEY="your-stripe-key" \
  prime-lux-events
```

## Production Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### AWS/DigitalOcean/VPS Deployment

1. Set up server with Node.js and PostgreSQL
2. Clone repository and install dependencies
3. Configure environment variables
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment-Specific Configurations

### Development
- Hot reloading enabled
- Source maps included
- Console logs preserved
- Database with sample data

### Staging
- Production build with development database
- Stripe test mode
- Email testing with services like Mailtrap

### Production
- Optimized build
- Console logs removed
- Database with real data
- Stripe live mode
- Real email service

## Database Migrations

### Creating Migrations

```bash
# Create new migration file
npm run db:migration:create migration_name

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback
```

### Backup and Restore

```bash
# Backup
pg_dump primelux_events > backup.sql

# Restore
psql primelux_events < backup.sql
```

## Monitoring and Logging

### Health Checks

The application includes health check endpoints:
- `/api/health` - Application health
- `/api/health/db` - Database connectivity
- `/api/health/stripe` - Stripe service status

### Logging

Logs are structured and include:
- Request/response logging
- Error tracking
- Performance metrics
- User activity logs

Consider using services like:
- Sentry for error tracking
- LogRocket for user session replay
- New Relic for performance monitoring

## Security Considerations

### HTTPS
Always use HTTPS in production with valid SSL certificates.

### Environment Variables
Never commit sensitive environment variables to version control.

### Database Security
- Use strong passwords
- Limit database access to application servers only
- Regular security updates

### Content Security Policy
The application includes CSP headers to prevent XSS attacks.

### Rate Limiting
Implement rate limiting for API endpoints to prevent abuse.

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Serve images in WebP/AVIF formats
- Implement lazy loading

### Caching
- Redis for session and data caching
- CDN for static assets
- Browser caching for images and fonts

### Database Optimization
- Use database indexes
- Optimize queries
- Connection pooling

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall rules

2. **Stripe Integration Issues**
   - Verify API keys are correct
   - Check webhook endpoint configuration
   - Ensure HTTPS for webhooks in production

3. **Email Delivery Issues**
   - Verify SMTP credentials
   - Check spam folders
   - Test with email testing services

4. **Build Failures**
   - Check TypeScript errors
   - Verify all environment variables are set
   - Clear `.next` directory and rebuild

### Logs Location

- Application logs: `/var/log/prime-lux-events/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: Check PostgreSQL data directory

## Support and Maintenance

### Regular Tasks
- Database backups (daily)
- Security updates (monthly)
- Performance monitoring (ongoing)
- SSL certificate renewal (annually)

### Monitoring Checklist
- [ ] Application uptime
- [ ] Database performance
- [ ] Payment processing
- [ ] Email delivery
- [ ] Error rates
- [ ] Response times

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Integration Guide](https://stripe.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Contact

For technical support or deployment assistance:
- Email: dev@primeluxevents.com
- Documentation: [Project Wiki]
- Issue Tracker: [GitHub Issues]