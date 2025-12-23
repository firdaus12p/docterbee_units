import express from "express";
import { query, queryOne } from "../db.mjs";
import { requireAdmin } from "../middleware/auth.mjs";

const router = express.Router();

// GET /api/events - List all events (public & admin)
router.get("/", async (req, res) => {
  try {
    const { mode, topic, limit = 50, includeInactive } = req.query;

    // For admin: includeInactive=true to see all events
    let sql =
      includeInactive === "true"
        ? "SELECT * FROM events WHERE 1=1"
        : "SELECT * FROM events WHERE is_active = 1";
    const params = [];

    if (mode && mode !== "all") {
      sql += " AND mode = ?";
      params.push(mode);
    }

    if (topic && topic !== "all") {
      sql += " AND topic = ?";
      params.push(topic);
    }

    sql += " ORDER BY event_date ASC LIMIT ?";
    params.push(parseInt(limit));

    const events = await query(sql, params);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data event",
    });
  }
});

// GET /api/events/:id - Get single event (public & admin)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeInactive } = req.query;

    // For admin: includeInactive=true to see inactive events
    const sql =
      includeInactive === "true"
        ? "SELECT * FROM events WHERE id = ?"
        : "SELECT * FROM events WHERE id = ? AND is_active = 1";

    const event = await queryOne(sql, [id]);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil detail event",
    });
  }
});

// POST /api/events - Create new event (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      eventDate,
      mode,
      topic,
      description,
      speaker,
      registrationFee,
      registrationDeadline,
      location,
      link,
    } = req.body;

    // Validation
    if (!title || !eventDate || !mode || !topic) {
      return res.status(400).json({
        success: false,
        error: "Data event tidak lengkap",
      });
    }

    // Insert event
    const result = await query(
      `INSERT INTO events 
       (title, event_date, mode, topic, description, speaker, registration_fee, registration_deadline, location, link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        eventDate,
        mode,
        topic,
        description || null,
        speaker || null,
        registrationFee || 0,
        registrationDeadline || null,
        location || null,
        link || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event berhasil dibuat",
      data: {
        id: result.insertId,
        title,
        eventDate,
        mode,
        topic,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat event",
    });
  }
});

// PATCH /api/events/:id - Update event (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      eventDate,
      mode,
      topic,
      description,
      speaker,
      registrationFee,
      registrationDeadline,
      location,
      link,
      isActive,
    } = req.body;

    // Check if event exists
    const existing = await queryOne("SELECT id FROM events WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Event tidak ditemukan",
      });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push("title = ?");
      params.push(title);
    }
    if (eventDate) {
      updates.push("event_date = ?");
      params.push(eventDate);
    }
    if (mode) {
      updates.push("mode = ?");
      params.push(mode);
    }
    if (topic) {
      updates.push("topic = ?");
      params.push(topic);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (speaker !== undefined) {
      updates.push("speaker = ?");
      params.push(speaker);
    }
    if (registrationFee !== undefined) {
      updates.push("registration_fee = ?");
      params.push(registrationFee);
    }
    if (registrationDeadline !== undefined) {
      updates.push("registration_deadline = ?");
      params.push(registrationDeadline);
    }
    if (location !== undefined) {
      updates.push("location = ?");
      params.push(location);
    }
    if (link !== undefined) {
      updates.push("link = ?");
      params.push(link);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      params.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada data untuk diupdate",
      });
    }

    params.push(id);

    await query(`UPDATE events SET ${updates.join(", ")} WHERE id = ?`, params);

    res.json({
      success: true,
      message: "Event berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengupdate event",
    });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existing = await queryOne("SELECT id FROM events WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Event tidak ditemukan",
      });
    }

    // Hard delete - permanently remove from database
    await query("DELETE FROM events WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Event berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus event",
    });
  }
});

export default router;
