# GDM Frontview

A modern financial management frontend application built with Next.js and TypeScript.

## Features

- Modern, responsive UI with Radix UI components
- Clickhouse database integration
- Advanced data visualization with AG Grid
- Interactive drag-and-drop functionality
- Real-time data fetching with TanStack Query
- Robust form handling with react-hook-form
- Comprehensive financial management tools

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Clickhouse database (for production)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sercanatalik/gdm-frontview.git
cd gdm-frontview
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=your-api-url
CLICKHOUSE_HOST=your-clickhouse-host
CLICKHOUSE_PORT=your-clickhouse-port
CLICKHOUSE_USERNAME=your-username
CLICKHOUSE_PASSWORD=your-password
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev`: Starts the development server with Turbopack
- `npm run build`: Builds the application for production
- `npm start`: Starts the production server
- `npm run lint`: Runs ESLint for code linting

## Project Structure

```
├── app/              # Main application routes and pages
├── components/       # Shared React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared logic
├── public/          # Static assets
└── styles/          # Global styles and theme configuration
```

## Technologies Used

- Framework: Next.js 14
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: Radix UI + shadcn/ui
- Data Grid: AG Grid
- State Management: TanStack Query
- Form Handling: React Hook Form
- Drag & Drop: dnd-kit

### UI Component System
The project uses shadcn/ui, a collection of pre-built Radix UI components with Tailwind CSS styling. This provides a consistent and polished look across the application while maintaining accessibility and performance standards.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, please contact the development team through the official channels.



