import express from "express";
import { query } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// ============================================
// LOCATION REPORTS API
// Provides aggregated sales and inventory data per location
// ============================================

// GET /api/reports/summary - Get overall summary across all locations
router.get("/summary", requireAdmin, async (req, res) => {
  try {
    // Get date range from query params (default to today)
    const { start_date, end_date } = req.query;
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = start_date || today;
    const endDate = end_date || today;

    // Total sales across all locations
    const salesResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(points_earned), 0) as total_points_earned
      FROM orders 
      WHERE status = 'completed' 
        AND DATE(completed_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Total reward redemptions across all locations
    const rewardsResult = await query(`
      SELECT 
        COUNT(*) as total_redemptions,
        COALESCE(SUM(points_cost), 0) as total_points_spent
      FROM reward_redemptions 
      WHERE DATE(redeemed_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Get location breakdown
    const locationBreakdown = await query(`
      SELECT 
        l.id as location_id,
        l.name as location_name,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM locations l
      LEFT JOIN orders o ON (o.location_id = l.id OR LOWER(o.store_location) = LOWER(l.name))
        AND o.status = 'completed'
        AND DATE(o.completed_at) BETWEEN ? AND ?
      WHERE l.is_active = 1
      GROUP BY l.id, l.name
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    res.json({
      success: true,
      data: {
        period: { start_date: startDate, end_date: endDate },
        summary: {
          total_orders: salesResult[0]?.total_orders || 0,
          total_revenue: parseFloat(salesResult[0]?.total_revenue) || 0,
          total_points_earned: salesResult[0]?.total_points_earned || 0,
          total_redemptions: rewardsResult[0]?.total_redemptions || 0,
          total_points_spent: rewardsResult[0]?.total_points_spent || 0,
        },
        by_location: locationBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching report summary:", error);
    res.status(500).json({ success: false, error: "Gagal memuat laporan" });
  }
});

// GET /api/reports/location/:id - Get detailed report for a specific location
router.get("/location/:id", requireAdmin, async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const { start_date, end_date } = req.query;
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = start_date || today;
    const endDate = end_date || today;

    // Verify location exists
    const location = await query("SELECT id, name FROM locations WHERE id = ?", [locationId]);
    if (location.length === 0) {
      return res.status(404).json({ success: false, error: "Lokasi tidak ditemukan" });
    }

    // Sales for this location
    const salesResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(points_earned), 0) as total_points_earned,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders 
      WHERE status = 'completed' 
        AND (location_id = ? OR LOWER(store_location) = LOWER(?))
        AND DATE(completed_at) BETWEEN ? AND ?
    `, [locationId, location[0].name, startDate, endDate]);

    // Order breakdown by status
    const ordersByStatus = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM orders 
      WHERE (location_id = ? OR LOWER(store_location) = LOWER(?))
        AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY status
    `, [locationId, location[0].name, startDate, endDate]);

    // Reward redemptions for this location
    const rewardsResult = await query(`
      SELECT 
        COUNT(*) as total_redemptions,
        COALESCE(SUM(points_cost), 0) as total_points_spent
      FROM reward_redemptions 
      WHERE location_id = ?
        AND DATE(redeemed_at) BETWEEN ? AND ?
    `, [locationId, startDate, endDate]);

    // Top selling products at this location
    const topProducts = await query(`
      SELECT 
        ps.product_id,
        p.name as product_name,
        ps.quantity as current_stock,
        COALESCE(sales.sold_qty, 0) as total_sold
      FROM product_stocks ps
      JOIN products p ON ps.product_id = p.id
      LEFT JOIN (
        SELECT 
          items.product_id,
          SUM(items.quantity) as sold_qty
        FROM orders o,
        JSON_TABLE(o.items, '$[*]' COLUMNS(
          product_id INT PATH '$.product_id',
          quantity INT PATH '$.quantity'
        )) AS items
        WHERE o.status = 'completed'
          AND (o.location_id = ? OR LOWER(o.store_location) = LOWER(?))
          AND DATE(o.completed_at) BETWEEN ? AND ?
        GROUP BY items.product_id
      ) as sales ON sales.product_id = ps.product_id
      WHERE ps.location_id = ?
      ORDER BY sales.sold_qty DESC
      LIMIT 10
    `, [locationId, location[0].name, startDate, endDate, locationId]);

    // Low stock alerts for this location
    const lowStockProducts = await query(`
      SELECT 
        ps.product_id,
        p.name as product_name,
        ps.quantity as current_stock
      FROM product_stocks ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.location_id = ?
        AND ps.quantity <= 5
        AND p.is_active = 1
      ORDER BY ps.quantity ASC
    `, [locationId]);

    res.json({
      success: true,
      data: {
        location: location[0],
        period: { start_date: startDate, end_date: endDate },
        sales: {
          total_orders: salesResult[0]?.total_orders || 0,
          total_revenue: parseFloat(salesResult[0]?.total_revenue) || 0,
          total_points_earned: salesResult[0]?.total_points_earned || 0,
          avg_order_value: parseFloat(salesResult[0]?.avg_order_value) || 0,
        },
        orders_by_status: ordersByStatus,
        rewards: {
          total_redemptions: rewardsResult[0]?.total_redemptions || 0,
          total_points_spent: rewardsResult[0]?.total_points_spent || 0,
        },
        top_products: topProducts,
        low_stock_alerts: lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching location report:", error);
    res.status(500).json({ success: false, error: "Gagal memuat laporan lokasi" });
  }
});

// GET /api/reports/inventory - Get inventory summary across all locations
router.get("/inventory", requireAdmin, async (req, res) => {
  try {
    // Stock summary per location
    const stockByLocation = await query(`
      SELECT 
        l.id as location_id,
        l.name as location_name,
        COUNT(DISTINCT ps.product_id) as product_count,
        COALESCE(SUM(ps.quantity), 0) as total_stock,
        SUM(CASE WHEN ps.quantity <= 5 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN ps.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
      FROM locations l
      LEFT JOIN product_stocks ps ON l.id = ps.location_id
      LEFT JOIN products p ON ps.product_id = p.id AND p.is_active = 1
      WHERE l.is_active = 1
      GROUP BY l.id, l.name
      ORDER BY l.name
    `);

    // Products with no stock in any location
    const productsWithoutStock = await query(`
      SELECT p.id, p.name, p.category
      FROM products p
      WHERE p.is_active = 1
        AND NOT EXISTS (
          SELECT 1 FROM product_stocks ps 
          WHERE ps.product_id = p.id AND ps.quantity > 0
        )
    `);

    // Overall totals
    const totals = await query(`
      SELECT 
        COUNT(DISTINCT ps.product_id) as total_products_with_stock,
        COALESCE(SUM(ps.quantity), 0) as total_units_in_stock
      FROM product_stocks ps
      JOIN products p ON ps.product_id = p.id
      WHERE p.is_active = 1
    `);

    res.json({
      success: true,
      data: {
        totals: {
          total_products_with_stock: totals[0]?.total_products_with_stock || 0,
          total_units_in_stock: totals[0]?.total_units_in_stock || 0,
          products_without_any_stock: productsWithoutStock.length,
        },
        by_location: stockByLocation,
        products_without_stock: productsWithoutStock,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    res.status(500).json({ success: false, error: "Gagal memuat laporan inventori" });
  }
});

// GET /api/reports/daily - Get daily sales trend
router.get("/daily", requireAdmin, async (req, res) => {
  try {
    const { location_id, days = 7 } = req.query;
    const numDays = Math.min(parseInt(days) || 7, 30); // Max 30 days

    let locationFilter = "";
    let params = [numDays];

    if (location_id) {
      // Get location name for fallback matching
      const location = await query("SELECT name FROM locations WHERE id = ?", [location_id]);
      if (location.length > 0) {
        locationFilter = "AND (o.location_id = ? OR LOWER(o.store_location) = LOWER(?))";
        params.push(location_id, location[0].name);
      }
    }

    const dailySales = await query(`
      SELECT 
        DATE(o.completed_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COALESCE(SUM(o.points_earned), 0) as points_earned
      FROM orders o
      WHERE o.status = 'completed'
        AND o.completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ${locationFilter}
      GROUP BY DATE(o.completed_at)
      ORDER BY date DESC
    `, params);

    res.json({
      success: true,
      data: {
        period_days: numDays,
        location_id: location_id ? parseInt(location_id) : null,
        daily_sales: dailySales,
      },
    });
  } catch (error) {
    console.error("Error fetching daily report:", error);
    res.status(500).json({ success: false, error: "Gagal memuat laporan harian" });
  }
});

export default router;
