#!/bin/bash

# Plant Saathi AI Production Deployment Script
# Configured for your specific setup with Neon and Render

set -e

echo "🚀 Starting Plant Saathi AI Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    # Install dependencies
    npm install
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
    print_status "Backend setup completed"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    # Install dependencies
    npm install
    
    # Build for production
    print_status "Building for production..."
    npm run build
    
    print_status "Frontend setup completed"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    cd backend
    
    # Test connection using your Neon database
    node -e "
    const { Pool } = require('pg');
    const pool = new Pool({ 
        connectionString: 'postgresql://neondb_owner:npg_D0wZTJ7uqdRr@ep-damp-pine-a83kg2ln-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    });
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        } else {
            console.log('✅ Database connection successful');
            process.exit(0);
        }
    });
    "
    
    cd ..
    print_status "Database connection test completed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    cd backend
    
    # Set environment variable for migration
    export DATABASE_URL="postgresql://neondb_owner:npg_D0wZTJ7uqdRr@ep-damp-pine-a83kg2ln-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
    
    # Run migrations
    npm run migrate
    
    cd ..
    print_status "Database migrations completed"
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Test backend health (if running locally)
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_status "✅ Backend health check passed"
    else
        print_warning "Backend not running locally (this is normal for production deployment)"
    fi
    
    print_status "Health checks completed"
}

# Main deployment flow
main() {
    print_status "Starting deployment process..."
    
    check_dependencies
    setup_backend
    setup_frontend
    test_database
    run_migrations
    health_check
    
    print_status "🎉 Local setup completed successfully!"
    print_status ""
    print_status "Next steps for production deployment:"
    echo "  1. Push your code to GitHub:"
    echo "     git add . && git commit -m 'Production ready' && git push"
    echo ""
    echo "  2. Deploy to Render:"
    echo "     - Connect your GitHub repo to Render"
    echo "     - Use the render.yaml configuration (already configured)"
    echo "     - Render will automatically deploy with your environment variables"
    echo ""
    echo "  3. Verify deployment:"
    echo "     curl https://your-render-app.onrender.com/health"
    echo "     curl https://your-render-app.onrender.com/api"
    echo ""
    echo "  4. Monitor your application:"
    echo "     - Check Render dashboard for logs"
    echo "     - Monitor health endpoints"
    echo "     - Review error logs if needed"
    echo ""
    print_status "Your application is now production-ready! 🚀"
}

# Run main function
main "$@" 