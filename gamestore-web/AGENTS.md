# Game Store Next.js App
 - A game store app: a software product where users can browse video games, view game details, add games to cart, purchase games and manage their own game library.
 
 # Technologies: 
  - Next.js + Neon DB + Drizzle ORM + Tailwind
 
 
 # Architectural Guidelines: 
  - **Service layer**: implement app business logic, used by the RESTful API and Server Actions
  - Use **modular design**: split the app into self-contained components, to avoid complex files with too much code
  - **Auth**: JWT tokens + bcrypt
  - **Database**: Neon DB + Drizzle ORM

  # User Interface Guidelines
   - Implement modern UI, responsive design, use server-rendered components in Next.js
   - Use server-side rendering, only use client components for browser interaction and forms