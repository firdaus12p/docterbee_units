# Rewards Management System

## Overview

The Rewards Management System allows administrators to create, edit, and manage reward redemption options that users can claim with their earned points. This feature integrates seamlessly with the existing points system and provides a dynamic, database-driven rewards catalog.

## Features

### Admin Dashboard - Rewards Manager

- **Create Rewards**: Add new reward options with customizable attributes
- **Edit Rewards**: Modify existing rewards without data loss
- **Delete Rewards**: Remove rewards (redemption history is preserved)
- **Status Control**: Activate/deactivate rewards without deletion
- **Visual Customization**: Choose color themes for better UI presentation
- **Sort Order**: Control the display order of rewards

### User-Facing Features

- **Dynamic Loading**: Rewards are loaded from the database in real-time
- **Fallback Support**: If API fails, default hardcoded rewards are shown
- **Redemption Tracking**: All redemptions are recorded in the database
- **Points Integration**: Seamlessly integrates with existing points system

## Database Schema

### `rewards` Table

```sql
CREATE TABLE rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INT NOT NULL,
  color_theme VARCHAR(50) DEFAULT 'amber',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### `reward_redemptions` Table (Updated)

```sql
CREATE TABLE reward_redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reward_id INT DEFAULT NULL,
  reward_name VARCHAR(255) NOT NULL,
  points_cost INT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL
)
```

## API Endpoints

### Public Endpoints

- `GET /api/rewards` - Get all active rewards (for frontend display)

### Admin Endpoints (require authentication)

- `GET /api/rewards/admin/all` - Get all rewards including inactive
- `GET /api/rewards/admin/:id` - Get single reward by ID
- `POST /api/rewards/admin` - Create new reward
- `PATCH /api/rewards/admin/:id` - Update reward
- `DELETE /api/rewards/admin/:id` - Delete reward

### Redemption Endpoint

- `POST /api/user-data/rewards/redeem` - Redeem a reward (requires auth)
  - Payload: `{ rewardId, rewardName, pointsCost }`

## Setup Instructions

### 1. Database Migration

The rewards table is automatically created when the server starts. To seed default rewards:

```bash
npm run migrate:seed-rewards
```

Or manually run the migration:

```bash
node -e "import('./backend/migrations/seed-default-rewards.mjs').then(m => m.up())"
```

### 2. Access Admin Dashboard

1. Navigate to `/admin-dashboard.html`
2. Login with admin credentials
3. Click on "Rewards Manager" tab
4. Start managing rewards

### 3. Frontend Integration

The rewards are automatically loaded on:

- Initial page load (`initStorePage()`)
- When switching to "My Points & Rewards" tab
- Fallback to hardcoded rewards if API fails

## Usage Examples

### Creating a New Reward (Admin)

1. Click "Tambah Reward" button
2. Fill in the form:
   - **Nama**: e.g., "Diskon 15%"
   - **Deskripsi**: e.g., "Dapatkan diskon 15% untuk pembelian selanjutnya"
   - **Biaya Poin**: e.g., 30
   - **Warna Tema**: Choose from amber, emerald, purple, sky, blue, rose
   - **Urutan Tampilan**: Lower numbers appear first (0, 1, 2...)
   - **Aktif**: Check to display in store
3. Click "Simpan"

### Editing a Reward (Admin)

1. In Rewards Manager, click "Edit" on any reward card
2. Modify the fields (all data is pre-filled)
3. Click "Simpan"
4. Changes are immediately reflected on the frontend

### Redeeming a Reward (User)

1. Navigate to Store page → "My Points & Rewards" tab
2. Click on any reward button
3. Confirm the redemption
4. Points are deducted and redemption is recorded

## Color Themes

Available color options for rewards:

- `amber` - Yellow/Gold (default)
- `emerald` - Green
- `purple` - Purple
- `sky` - Light Blue
- `blue` - Blue
- `rose` - Pink/Red

These colors are applied to:

- Points cost label
- Button hover effects
- Border highlights

## File Structure

```
backend/
├── db.mjs                          # Added rewards table initialization
├── server.mjs                      # Mounted rewards router
├── routes/
│   ├── rewards.mjs                 # NEW: Rewards CRUD API
│   └── user-data.mjs               # Updated: Added rewardId to redemption
└── migrations/
    └── seed-default-rewards.mjs    # NEW: Default rewards seeding

js/
├── script.js                       # Updated: Added dynamic reward loading
├── admin-dashboard.js              # Updated: Added rewards section handling
└── rewards-manager.js              # NEW: Rewards management logic

admin-dashboard.html                # Updated: Added Rewards Manager section
store.html                          # Updated: Dynamic rewards loading
```

## Error Handling

### Frontend

- API failure → Falls back to hardcoded default rewards
- Missing container → Logs warning, skips rendering
- Network errors → User sees default rewards

### Backend

- Invalid data → Returns 400 with error message
- Not found → Returns 404 with error message
- Database errors → Returns 500 with error message
- Unauthorized → Returns 401 (admin endpoints only)

## Testing Checklist

- [x] Database tables created successfully
- [x] Seed migration adds default rewards
- [x] Admin can view all rewards
- [x] Admin can create new rewards
- [x] Admin can edit rewards (data persists in form)
- [x] Admin can delete rewards
- [x] Admin can toggle active status
- [x] Frontend loads rewards from API
- [x] Frontend falls back to defaults on API failure
- [x] Users can redeem rewards
- [x] Points are deducted correctly
- [x] Redemption is recorded in database
- [x] Reward history shows correct data
- [x] No duplicate code exists
- [x] No unused code exists
- [x] All existing functionality works

## Future Enhancements

Potential improvements for future versions:

1. **Expiry Dates**: Add expiry dates for time-limited rewards
2. **Stock Limits**: Set maximum redemptions per reward
3. **User Categories**: Restrict certain rewards to specific user tiers
4. **Images**: Add reward images for better visual appeal
5. **Redemption Codes**: Generate unique codes for each redemption
6. **Analytics**: Track most popular rewards and redemption patterns

## Troubleshooting

### Rewards not showing in store

1. Check if rewards are marked as `is_active = 1`
2. Verify API endpoint `/api/rewards` returns data
3. Check browser console for JavaScript errors
4. Ensure `loadAndRenderRewards()` is called

### Edit button not working

1. Verify `rewards-manager.js` is loaded
2. Check if `API_BASE` is defined in admin-dashboard.js
3. Ensure admin is authenticated
4. Check network tab for API errors

### Points not deducting after redemption

1. Verify user is logged in
2. Check `/api/user-data/rewards/redeem` endpoint
3. Ensure user has sufficient points in `user_progress` table
4. Check backend logs for errors

## Support

For issues or questions, check:

- Backend logs: Check server console for API errors
- Frontend logs: Check browser console for JavaScript errors
- Database: Verify tables and data using phpMyAdmin
- Documentation: Refer to `rules-for-ai.md` for codebase conventions
