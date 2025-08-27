# Notion API Demo - Interactive Frontend

A comprehensive Vite + Vanilla JavaScript frontend application for exploring and testing the Notion API. This demo provides an intuitive interface to interact with all major Notion API endpoints including Users, Databases, Pages, Blocks, Search, and Comments.

![Notion API Demo](https://img.shields.io/badge/Notion-API-blue?logo=notion&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Features

### 🔧 Core Functionality
- **Complete API Coverage**: Test all major Notion API endpoints
- **Real-time Testing**: Interactive forms with live API calls
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Token Management**: Secure token storage with validation
- **Response Viewer**: Formatted JSON responses with syntax highlighting

### 👥 Users API
- List all workspace users
- Get specific user information
- Retrieve bot user details
- Workspace statistics overview

### 🗄️ Databases API
- Retrieve database schema and properties
- Query databases with filters and sorting
- Advanced query builder with multiple filter types
- Support for all property types (select, multi-select, title, rich text, etc.)

### 📄 Pages API
- Create new pages with content
- Retrieve page information and properties
- Update page properties
- Archive pages
- Get specific page property values

### 🧩 Blocks API
- Retrieve block children (page content)
- Get individual block information
- Support for all block types

### 🔍 Search API
- Full-text search across workspace
- Filtered search by object type
- Sorting options
- Recent searches tracking

### 💬 Comments API
- Retrieve page comments
- Add new comments
- Discussion thread support

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with TailwindCSS
- **Toast Notifications**: Real-time feedback for all operations
- **Loading States**: Visual indicators for ongoing operations
- **Form Validation**: Input validation with helpful error messages
- **Code Examples**: Copy-pasteable code snippets
- **Recent History**: Track recent searches and operations

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0+ 
- **npm** 9.0+ 
- A **Notion integration token** ([Get one here](https://www.notion.so/my-integrations))

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd examples/frontend/vite-notion-demo

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp environment.example.txt .env

# Edit .env and add your Notion integration token
# VITE_NOTION_API_TOKEN=secret_your_token_here
# or
# VITE_NOTION_API_TOKEN=ntn_your_token_here
```

### 3. Get Your Notion Token

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Fill in the basic information:
   - **Name**: `Notion API Demo`
   - **Logo**: (optional)
   - **Associated workspace**: Select your workspace
4. Click **"Submit"**
5. Copy the **"Internal Integration Token"** (starts with `secret_` or `ntn_`)
6. Paste it in your `.env` file as `VITE_NOTION_API_TOKEN`

### 4. Share Content with Integration

Your integration needs access to your Notion content:

1. Open a Notion page or database you want to test with
2. Click **"Share"** in the top-right corner
3. Click **"Add people, emails, groups, or integrations"**
4. Search for your integration name and select it
5. Choose appropriate permissions (usually "Can edit")
6. Click **"Invite"**

### 5. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📖 Usage Guide

### Getting Started
1. **Add Your Token**: Enter your Notion integration token in the banner
2. **Choose an API Section**: Click on Users, Databases, Pages, Blocks, Search, or Comments tabs
3. **Fill Forms**: Enter required IDs and parameters
4. **Execute Requests**: Click buttons to make API calls
5. **View Results**: See formatted JSON responses and any errors

### Finding IDs

**Page/Database IDs**: Copy from the URL in your browser
- `https://notion.so/myworkspace/DatabaseName-8e2c2b769e1d47d287b9ed3035d607ae`
- ID: `8e2c2b769e1d47d287b9ed3035d607ae`

**User IDs**: Use the "List Users" endpoint to find user IDs

**Block IDs**: Use the "Get Page" endpoint to find block IDs in the response

### Example Workflows

#### 1. Explore Your Workspace
1. Go to **Users** tab → Click "List Users" to see all workspace members
2. Click "Get Bot User" to see your integration's information
3. Click "Workspace Stats" to get an overview

#### 2. Work with Databases
1. Go to **Databases** tab
2. Enter a database ID and click "Get Database" to see its schema
3. Use "Query Database" to retrieve entries
4. Try "Advanced Query" with filters

#### 3. Create and Manage Pages
1. Go to **Pages** tab
2. Create a new page by entering parent ID and title
3. Use "Get Page" to retrieve page information
4. Update page properties or archive pages

### Tips for Best Results
- Start with the **Users** tab to verify your token works
- Use **Search** to find content IDs quickly
- Check the browser console for detailed API logs
- Copy JSON responses to analyze data structure
- Use the settings gear to manage your configuration

## 🛠️ Development

### Project Structure

```
vite-notion-demo/
├── src/
│   ├── components/          # UI components and managers
│   │   ├── ToastManager.js  # Toast notifications
│   │   └── UIManager.js     # Main UI controller
│   ├── utils/               # Utility classes
│   │   ├── api.js          # Notion API wrapper
│   │   └── storage.js      # Local storage manager
│   ├── styles/             # CSS styles
│   │   └── main.css        # Main stylesheet with Tailwind
│   └── main.js             # Application entry point
├── public/                 # Static assets
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vercel.json            # Deployment configuration
└── README.md              # This file
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint JavaScript and HTML
npm run format       # Format code with Prettier
npm run type-check   # Type check with TypeScript

# Utilities
npm ci              # Clean install dependencies
```

### Key Technologies

- **[Vite](https://vitejs.dev/)**: Fast build tool and dev server
- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework  
- **[Axios](https://axios-http.com/)**: HTTP client for API calls
- **Vanilla JavaScript**: Pure ES2020+ JavaScript, no framework dependencies

### Code Architecture

#### API Layer (`src/utils/api.js`)
- Comprehensive wrapper for all Notion API endpoints
- Automatic retry logic and rate limiting
- Error formatting and user-friendly messages
- Utility methods for creating common data structures

#### UI Layer (`src/components/UIManager.js`)
- Tab-based interface for different API sections
- Form generation and validation
- Result display with JSON formatting
- Modal and notification management

#### Storage Layer (`src/utils/storage.js`)
- Secure local storage with encryption
- Automatic cleanup and expiration
- Settings and cache management
- Data export/import functionality

#### Toast System (`src/components/ToastManager.js`)
- Non-blocking notifications
- Multiple types (success, error, warning, info)
- Action buttons and persistence options
- Automatic cleanup and management

### Environment Variables

All environment variables are prefixed with `VITE_` to expose them to the client:

```bash
# Required
VITE_NOTION_API_TOKEN=secret_your_token_here  # or ntn_your_token_here

# Optional Configuration
VITE_NOTION_API_VERSION=2022-06-28
VITE_DEFAULT_PAGE_SIZE=100
VITE_API_TIMEOUT=30000
VITE_DEBUG_LOGGING=true
VITE_DEFAULT_THEME=light
VITE_TOAST_DURATION=5000
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Fork/Clone** this repository
2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect it as a Vite project

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `VITE_NOTION_API_TOKEN` with your token
   - Add any other optional variables

4. **Deploy**: Vercel will automatically deploy on every push to main branch

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/notion-api-docs/tree/main/examples/frontend/vite-notion-demo)

### Deploy to Netlify

1. **Connect Repository** to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add `VITE_NOTION_API_TOKEN` in Site Settings
4. **Deploy**: Automatic deployment on git push

### Deploy to Railway

1. **Connect Repository** to Railway
2. **Environment Variables**: Add `VITE_NOTION_API_TOKEN`
3. Railway will auto-detect and deploy the Vite app

### Self-Hosted Deployment

```bash
# Build the application
npm run build

# Serve the dist/ directory with any static file server
# Examples:
npx serve dist
# or
python -m http.server -d dist 8000
# or  
nginx -c nginx.conf
```

## 🔒 Security Considerations

### Token Security
- **Never commit** your `.env` file to version control
- **Use environment variables** for your Notion token in production
- **Rotate tokens** regularly for enhanced security
- **Limit integration permissions** to only what's needed

### Content Security Policy
The app includes CSP headers to prevent XSS attacks:
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval';
connect-src 'self' https://api.notion.com;
```

### HTTPS Requirements
- Notion API requires HTTPS for all requests
- Ensure your deployment uses HTTPS (Vercel/Netlify provide this automatically)

### CORS Handling
- **Development**: Vite proxy server routes requests through `/api/notion/*` to bypass CORS restrictions
- **Production**: Direct API calls work fine when deployed to a hosted domain
- The app automatically detects the environment and uses the appropriate base URL

## 🐛 Troubleshooting

### Common Issues

#### "Authentication failed" error
- ✅ Check that your token starts with `secret_` or `ntn_`
- ✅ Verify the token is correctly set in your `.env` file
- ✅ Ensure you've shared pages/databases with your integration

#### "Resource not found" error  
- ✅ Verify the ID format (32 characters, hex)
- ✅ Check that the page/database is shared with your integration
- ✅ Ensure the resource hasn't been deleted or moved

#### "Access denied" error
- ✅ Share the specific page/database with your integration
- ✅ Check integration permissions in Notion settings
- ✅ Verify the workspace connection

#### Network/CORS errors
- ✅ **Development**: The app uses a proxy to bypass CORS restrictions when running locally
- ✅ **Production**: Ensure the app is deployed to a hosted domain (not localhost)
- ✅ Check browser developer console for detailed errors
- ✅ If you see CORS errors, restart the development server with `npm run dev`

### Debug Mode

Enable debug logging by setting `VITE_DEBUG_LOGGING=true` in your `.env` file. This will show detailed API request/response information in the browser console.

### Getting Help

1. **Check the Console**: Browser developer tools often show helpful error details
2. **API Documentation**: Refer to [developers.notion.com](https://developers.notion.com)  
3. **Integration Settings**: Verify your integration setup in Notion
4. **Community**: Join the [Notion Developers Slack](https://join.slack.com/t/notiondevs/shared_invite/zt-20b5996xv-DzJdLiympy6jP0GGzu3AMg)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Areas for Contribution
- 🐛 **Bug fixes** and error handling improvements
- ✨ **New features** and API endpoint coverage
- 📚 **Documentation** improvements and examples
- 🎨 **UI/UX** enhancements and accessibility
- ⚡ **Performance** optimizations
- 🧪 **Testing** and quality assurance

### Code Style
- Use **Prettier** for formatting: `npm run format`
- Follow **ESLint** rules: `npm run lint`
- Write **clear commit messages** using conventional commits
- **Comment** complex logic and API interactions
- Follow **existing patterns** in the codebase

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE) file for details.

## 🙏 Acknowledgments

- **Notion Team** for providing an excellent API
- **Vite Team** for the amazing build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Open Source Community** for the tools and libraries

---

## 📊 API Coverage

This demo covers all major Notion API endpoints:

| Endpoint Category | Coverage | Endpoints |
|------------------|----------|-----------|
| **Users** | ✅ Complete | List Users, Get User, Get Bot User |
| **Databases** | ✅ Complete | Get Database, Query Database, Create Database, Update Database |
| **Pages** | ✅ Complete | Get Page, Create Page, Update Page, Archive Page, Get Page Property |
| **Blocks** | ✅ Core | Get Block, Get Block Children, Append Block Children, Update Block, Delete Block |
| **Search** | ✅ Complete | Search with filters and sorting |
| **Comments** | ✅ Complete | Get Comments, Create Comment |

## 🎯 Roadmap

- [ ] **Block Editor**: Visual block creation and editing
- [ ] **Database Schema Builder**: Visual property configuration  
- [ ] **Template System**: Pre-built page and database templates
- [ ] **Bulk Operations**: Multi-item operations and batch processing
- [ ] **Export Features**: Export data to various formats (CSV, JSON, etc.)
- [ ] **Advanced Analytics**: API usage statistics and insights
- [ ] **Collaboration**: Multi-user testing and sharing
- [ ] **Mobile App**: React Native mobile version

---

**Made with ❤️ for the Notion developer community** 