# API Contracts Documentation

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register new user | No |
| `POST` | `/login` | Login user | No |
| `POST` | `/logout` | Logout user | Yes |
| `GET` | `/me` | Get current user | Yes |
| `GET` | `/check` | Check login status | No |
| `POST` | `/change-password` | Change user password | Yes |
| `POST` | `/update-email` | Request email update | Yes |
| `GET` | `/verify-email` | Verify email token | No |
| `POST` | `/resend-verification` | Resend verification email | Yes |
| `POST` | `/forgot-password` | Request password reset | No |
| `POST` | `/reset-password` | Reset password with token | No |

## Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all products | No |
| `GET` | `/:id` | Get single product | No |
| `POST` | `/` | Create product | Admin |
| `PATCH` | `/:id` | Update product | Admin |
| `DELETE` | `/:id` | Delete product | Admin |
| `GET` | `/:id/stocks` | Get product stocks (multi-location) | Admin |
| `PATCH` | `/:id/stocks` | Update location specific stock | Admin |
| `POST` | `/:id/stocks/bulk` | Bulk update stocks | Admin |

## Services (`/api/services`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all services | No |
| `GET` | `/:id` | Get service detail | No |
| `POST` | `/` | Create service | Admin |
| `PATCH` | `/:id` | Update service | Admin |
| `DELETE` | `/:id` | Delete service | Admin |

## Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create booking | Yes |
| `GET` | `/my-bookings` | Get user bookings | Yes |
| `GET` | `/` | List all bookings | Admin |
| `PATCH` | `/:id/status` | Update booking status | Admin |

## Journeys (`/api/journeys`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List active journeys | No |
| `GET` | `/:slug` | Get journey details | No |
| `GET` | `/:slug/progress` | Get user progress | Yes |
| `POST` | `/:slug/progress` | Update progress | Yes |

## Events (`/api/events`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List events | No |
| `POST` | `/register` | Register for event | Yes |

## Store (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/checkout` | Create order | Yes |
| `GET` | `/my-orders` | Get user orders | Yes |
| `GET` | `/` | List all orders | Admin |

## Rewards (`/api/rewards`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List rewards | No |
| `POST` | `/redeem` | Redeem reward | Yes |
