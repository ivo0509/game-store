# Game Store Mobile App
A game store app: Browse games, search games, view game details, add to cart, checkout, view library, view wishlist

# Tech Guidelines
 - Technologies: React Native + Expo + Expo Router
 - Back-end: Game Store RESTful API, with "Bearer token" auth
 - Back-end API source code: `..\gamestore-web\src\app\api`
 - Modular design: split the app into meaningful components, to avoid too much code in a single file iand reuse repeating code

 # Mobile User Interface Guidelines
  - Implement user-friendly UI, stack navigation, responsive layout (for tablets / smartphones)
  - Mobile UI Alerts: ensure all native alerts, confirms and other system dialogs have a fallback for Web (implemented as modal popups)