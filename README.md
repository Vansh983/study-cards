# Study Quick

A modern web application built with Next.js that helps users study and learn more effectively.

## Features

- Modern, responsive UI built with Tailwind CSS and Radix UI components
- Authentication system using NextAuth.js
- Real-time updates and state management with Zustand
- PDF processing capabilities
- Integration with OpenAI for intelligent features
- Stripe integration for payment processing
- Beautiful animations with Framer Motion
- Dark mode support with next-themes

## Tech Stack

- **Framework:** Next.js 13.5 with TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Authentication:** NextAuth.js
- **Database:** Firebase
- **State Management:** Zustand
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form with Zod validation
- **Payment Processing:** Stripe
- **AI Integration:** OpenAI

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd study-quick
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the necessary environment variables.

4. Run the development server:
```bash
yarn dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `yarn dev` - Run the development server
- `yarn build` - Build the production application
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint for code linting

## Project Structure

- `/app` - Main application pages and components
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks
- `/contexts` - React context providers
- `/public` - Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Study Quick License. See the [LICENSE](LICENSE) file for details.

The software may be used, modified, and distributed for non-commercial purposes only. Any commercial use requires explicit written permission from Vansh Sood. 