# AECOIN Store

## Overview

AECOIN Store is a gaming e-commerce platform for selling virtual GTA Online currency (AECOIN packages). The application features a cyberpunk/neon-themed dark interface, Discord OAuth authentication, dual payment gateways (ToyyibPay + Billplz), and automated code delivery via email and FiveM database integration.

## Recent Updates (Admin Dashboard Enhancement - COMPLETED)

### Latest Fixes (January 2025):
1. **Package Image Upload Fix** ✅
   - Increased Express body parser limit from 100kb to 10MB
   - Handles base64 encoded package images without payload errors
   - Server logs confirm successful package updates

2. **Admin Rankings Full CRUD System** ✅
   - Expanded from 3 to 10 player rankings with complete CRUD operations
   - Backend API routes: POST, PATCH, DELETE /api/admin/rankings
   - Frontend form with all fields: userId, playerName, stars, rank (1-10)
   - Image upload with base64 encoding (2MB client validation)
   - Crown type selection: gold, silver, bronze, diamond, ruby
   - Edit and Delete buttons for each ranking
   - Empty state with helpful prompts

3. **Admin Sidebar Navigation** ✅
   - Dedicated left sidebar (256px) for all admin pages
   - Removed top navigation from admin pages
   - Clean admin interface with consistent navigation
   - Admin avatar shows username initials (non-updatable)

4. **Select Component Fix** ✅
   - Crown type select uses "none" instead of empty string
   - Converts "none" to null when submitting to backend
   - Prevents Radix UI Select error about empty string values

### Completed (Critical Security Fixes):
1. **PendingPayment System** - Prevents cart tampering and payment fraud
   - Database table tracks payment intent before completion
   - Stores cart snapshot, amount, currency for verification
   - Unique constraint on externalId (paymentIntentId/billCode)

2. **Payment Result Pages** - Better user experience
   - /payment/pending - Loading state during verification
   - /payment/cancelled - Payment cancellation handling
   - /payment/failed - Error page with troubleshooting

3. **Stripe Removal** - Streamlined to Malaysian payment gateways only ✅
   - Removed Stripe payment gateway completely
   - Updated all frontend/backend code to remove Stripe references
   - Updated environment variables and documentation
   - Simplified payment flow to focus on local payment methods

4. **ToyyibPay Production Security** - Malaysian payment gateway hardening ✅
   - PendingPayment integration with cart snapshot
   - Server-side transaction verification via getBillTransactions
   - Amount matching with ToyyibPay cents format handling
   - Idempotency checks prevent duplicate order creation
   - Removed vulnerable /api/complete-toyyibpay-order endpoint
   - Return handler validates against PendingPayment, not live cart
   - Proper error handling with user-friendly redirects

5. **Admin Dashboard** - Complete operations management system ✅
   - Admin role system with isAdmin column in users table
   - requireAdmin middleware protecting all admin routes
   - Admin Orders Page: View all orders, filter by status, search, update status, view codes
   - Admin Packages Page: Full CRUD operations, mark popular packages
   - Admin Coupons Page: Full CRUD operations with validation (code format, expiry, limits)
   - Admin navigation in header dropdown (visible only to admins)
   - Access control: Non-admin users shown "ACCESS DENIED"
   - Cyberpunk aesthetic matching main site design

6. **Billplz Production Security** - Second Malaysian payment gateway ✅
   - PendingPayment integration with cart snapshot (prevents cart tampering)
   - X-Signature callback verification using raw body and HMAC-SHA256
   - Raw body middleware (express.text) for signature verification
   - Server-side bill verification via Billplz API
   - Amount matching with Billplz cents format handling
   - Idempotency checks prevent duplicate order creation
   - Return handler validates against PendingPayment, not live cart
   - Security parity with ToyyibPay flow
   - Required environment variables: BILLPLZ_SECRET_KEY, BILLPLZ_SIGNATURE_KEY

7. **Admin Credentials & Management Features** - Environment-based admin system ✅
   - ADMIN_USERNAME and ADMIN_PASSWORD environment variables for admin account
   - /api/init-admin endpoint auto-creates admin from environment credentials
   - Admin Package Management: Full CRUD with image upload (base64), original price, display price, featured toggle
   - Admin Rankings Management: Upload images for top 3 players, select crown types (gold, silver, bronze, diamond, ruby)
   - Database schema updates: rankings.imageUrl and rankings.crownType fields
   - All admin routes protected with requireAdmin middleware
   - Admin navigation added to header dropdown (Packages, Rankings, Coupons, Orders, Settings)
   - Base64 image uploads with 2MB client-side validation

### Next Phase:
8. Email domain verification (aeofficial.my on Resend)
9. End-to-end testing of both payment gateways

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type safety and component development
- Vite for fast development builds and hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching
- shadcn/ui component library with Radix UI primitives for accessible UI components
- Tailwind CSS for utility-first styling with custom cyberpunk/neon design tokens

**Design System**
- Dark mode with cyberpunk aesthetic (deep black backgrounds, neon yellow/cyan accents)
- Custom fonts: Bebas Neue, Rajdhani, Teko for headers; sans-serif for body text
- Neon glow effects and hover animations throughout
- Mobile-first responsive grid layouts

**Key Pages & Components**
- Home page with hero slider, package cards, gallery, FAQ, and "how it works" sections
- Rankings page with player leaderboard and top 3 podium display
- Checkout page with two payment options: ToyyibPay (Malaysia), Billplz (Malaysia)
- Orders page for viewing purchase history and redemption codes
- Reusable components: Header with cart, PackageCard, CartDrawer, Footer

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- Session-based authentication using express-session
- Middleware for JSON parsing, URL encoding, and CORS handling

**API Structure**
- RESTful endpoints under `/api` namespace
- Authentication routes: `/api/auth/discord`, `/api/auth/discord/callback`, `/api/auth/me`, `/api/auth/logout`
- Resource routes: packages, cart, orders, coupons, checkout, rankings
- Rankings routes: `/api/rankings` (all players), `/api/rankings/top/:limit` (top N players)
- All routes require authentication via session middleware except OAuth flow and rankings (public)

**Business Logic Flow**
1. User authenticates via Discord OAuth
2. Browses and adds AECOIN packages to cart
3. Proceeds to checkout with optional coupon codes
4. Stripe creates payment intent and processes payment
5. Upon successful payment, system generates unique redemption codes
6. Codes are inserted into FiveM MySQL database for in-game redemption
7. Order confirmation email sent with redemption codes via Resend

### Data Storage

**Primary Database (PostgreSQL via Neon)**
- Drizzle ORM for type-safe database queries
- Schema includes: users, packages, cart_items, orders, order_items, redemption_codes, coupons, player_rankings
- UUID primary keys with automatic generation
- Foreign key constraints with cascade deletes for data integrity
- Player rankings table stores leaderboard data with stars (achievement points) and rank positions

**FiveM Database (MySQL)**
- Separate MySQL connection pool for external FiveM game server
- Inserts redemption codes with credit values into `ak4y_donatesystem_codes` table
- Configurable table/column names via environment variables

### Authentication & Authorization

**Discord OAuth 2.0**
- PKCE flow with state parameter for CSRF protection
- Scopes: `identify`, `email`
- Stores Discord ID, username, email, and avatar in user table
- Session-based authentication with secure HTTP-only cookies
- 7-day session expiration

**Session Management**
- PostgreSQL session store via connect-pg-simple (if configured)
- In-memory store fallback for development
- Secure cookies in production with SameSite and HTTPS enforcement

### Payment Processing

**Malaysian Payment Gateways**
- ToyyibPay and Billplz for local payment methods (FPX, online banking, cards, e-wallets)
- Server-side bill creation and verification
- Callback handling for payment completion
- Automatic order status updates upon successful payment

**Flow**
1. Frontend requests bill creation with order total and optional coupon
2. Backend creates ToyyibPay/Billplz bill and returns payment URL
3. User is redirected to payment gateway to complete payment
4. Gateway processes payment and sends callback to backend
5. Backend verifies payment, creates order, generates codes
6. Codes inserted into FiveM database and emailed to user

## External Dependencies

### Third-Party Services

**ToyyibPay** - Malaysian payment gateway (FPX, online banking)
- Required environment variable: `TOYYIBPAY_SECRET_KEY`
- Bills API integration with server-side transaction verification

**Billplz** - Malaysian payment gateway (FPX, cards, e-wallets)
- Required environment variables: `BILLPLZ_SECRET_KEY`, `BILLPLZ_SIGNATURE_KEY`
- Bills API v3 with X-Signature HMAC verification

**Discord** - OAuth authentication provider
- Required environment variables: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`
- OAuth scopes: identify, email

**Resend** - Transactional email service for order confirmations
- Uses Replit Connectors API to fetch credentials dynamically
- Sends HTML emails with redemption codes and order details

**Neon** - Serverless PostgreSQL database
- Required environment variable: `DATABASE_URL`
- WebSocket-based connection pooling

**FiveM** - Game server database integration (MySQL)
- Required environment variables: `FIVEM_DB_HOST`, `FIVEM_DB_USER`, `FIVEM_DB_PASSWORD`, `FIVEM_DB_NAME`, `FIVEM_DB_PORT`
- Optional: `FIVEM_DB_TABLE`, `FIVEM_DB_COLUMN_CODE`, `FIVEM_DB_COLUMN_CREDITSVALUE`

### Key NPM Packages

**UI & Styling**
- `@radix-ui/*` - Headless UI primitives (dialogs, dropdowns, tooltips, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe component variants
- `lucide-react` - Icon library

**State & Data Fetching**
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form validation
- `zod` - Schema validation

**Database & ORM**
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - Neon database driver
- `mysql2` - MySQL client for FiveM database

**Authentication & Payments**
- `express-session` - Session middleware
- `connect-pg-simple` - PostgreSQL session store

**Email**
- `resend` - Email API client