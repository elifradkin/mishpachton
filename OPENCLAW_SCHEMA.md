# Family Manager Data Schema — OpenClaw Agent Instructions
# ═══════════════════════════════════════════════════════
#
# CRITICAL: The Mishpachton web app reads these JSON files directly.
# You MUST follow these exact schemas. Do NOT simplify or flatten them.
#
# DIRECTORY: ~/.openclaw/workspace-zohar/family-manager/data/
#
# ─── RULES ───
# 1. ALWAYS read the existing file before writing — APPEND new entries, never overwrite arrays
# 2. Use auto-incrementing IDs: feed_001, feed_002, diaper_001, sleep_001, etc.
# 3. All timestamps: ISO 8601 with timezone — "2026-03-12T14:30:00+02:00"
# 4. All dates: YYYY-MM-DD
# 5. All times: HH:MM (24h)
# 6. Include both Hebrew (_he) and English (_en) labels where specified
# 7. After ANY raw data file changes, REGENERATE ALL derived files
# 8. When regenerating derived files, COUNT from the raw data — do NOT guess
# 9. person_id for baby = "lia", mother = "zohar", father = "eli"
#
# ═══════════════════════════════════════════════════════
# RAW DATA FILES
# ═══════════════════════════════════════════════════════

## ─── feeding.json ───
# EVERY feeding event. APPEND new entries. Never delete old ones.
# type: "nursing" | "bottle" | "pumped"
# side_first: "left" | "right" | "both" | null
{
  "feeding_log": [
    {
      "id": "feed_001",
      "person_id": "lia",
      "date": "2026-03-11",
      "type": "bottle",
      "type_he": "בקבוק תמ״ל",
      "start_time": "13:30",
      "end_time": null,
      "duration_min": null,
      "amount_ml": 30,
      "formula_brand": "סיסי",
      "side_first": null,
      "side_second": null,
      "notes": "האכלה ראשונה אחרי יציאה מבית חולים",
      "created_at": "2026-03-11T21:18:00+02:00"
    },
    {
      "id": "feed_003",
      "person_id": "lia",
      "date": "2026-03-11",
      "type": "nursing",
      "type_he": "הנקה",
      "start_time": "19:20",
      "end_time": "21:00",
      "duration_min": 100,
      "amount_ml": null,
      "formula_brand": null,
      "side_first": "both",
      "side_second": null,
      "notes": "שני הצדדים",
      "created_at": "2026-03-11T21:18:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "person_id": "lia",
  "created_at": "2026-03-11T14:27:00+02:00",
  "updated_at": "ALWAYS_UPDATE_THIS_TIMESTAMP"
}

## ─── diapers.json ───
# type: "wet" | "dirty" | "both" | "dry"
{
  "diaper_log": [
    {
      "id": "diaper_001",
      "person_id": "lia",
      "date": "2026-03-11",
      "time": "16:00",
      "type": "both",
      "type_he": "קקי + פיפי",
      "color": null,
      "consistency": null,
      "notes": "",
      "created_at": "2026-03-11T21:18:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "person_id": "lia",
  "created_at": "2026-03-11T14:27:00+02:00",
  "updated_at": "ALWAYS_UPDATE_THIS_TIMESTAMP"
}

## ─── sleep.json ───
# type: "nap" | "night_sleep"
# quality: "good" | "fair" | "poor" | "unknown"
{
  "sleep_log": [
    {
      "id": "sleep_001",
      "person_id": "lia",
      "date": "2026-03-12",
      "type": "nap",
      "type_he": "תנומה",
      "start_time": "10:00",
      "end_time": "11:30",
      "duration_min": 90,
      "quality": "good",
      "quality_he": "טובה",
      "location": null,
      "notes": "",
      "created_at": "2026-03-12T11:30:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "person_id": "lia",
  "created_at": "2026-03-11T14:27:00+02:00"
}

## ─── health.json ───
# type: "weight" | "temperature" | "height" | "head_circumference" | "symptom" | "milestone" | "note"
{
  "health_log": [
    {
      "id": "health_001",
      "person_id": "lia",
      "date": "2026-03-12",
      "time": "09:00",
      "type": "weight",
      "type_he": "משקל",
      "value": 3.2,
      "unit": "kg",
      "description": null,
      "notes": "שקילה בטיפת חלב",
      "created_at": "2026-03-12T09:00:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "created_at": "2026-03-11T14:27:00+02:00"
}

## ─── recovery.json ───
# Mother postpartum recovery. One entry per day.
{
  "recovery_log": [
    {
      "date": "2026-03-12",
      "person_id": "zohar",
      "hydration_glasses": 7,
      "hydration_goal": 10,
      "supplements_taken": ["ברזל", "ויטמין D", "סידן"],
      "supplements_missed": ["אומגה 3"],
      "symptoms": ["עייפות"],
      "sleep_hours": 5.5,
      "sleep_quality": "fair",
      "mood_rating": 3,
      "energy_rating": 3,
      "notes": ""
    }
  ],
  "person_id": "zohar",
  "delivery_date": "2026-03-09",
  "schema_version": "1.0",
  "created_at": "2026-03-11T14:27:00+02:00"
}

## ─── tasks.json ───
# priority: "critical" | "high" | "medium" | "low"
# status: "todo" | "in_progress" | "done" | "cancelled"
# category: "logistics" | "shopping" | "household" | "baby_care" | "health" | "admin" | "moving" | "other"
{
  "tasks": [
    {
      "id": "task_001",
      "title": "מעבר דירה",
      "title_en": "Moving",
      "category": "logistics",
      "category_he": "לוגיסטיקה",
      "assigned_to": "eli",
      "priority": "high",
      "priority_he": "גבוהה",
      "status": "todo",
      "status_he": "לביצוע",
      "due_date": null,
      "completed_at": null,
      "notes": "",
      "subtasks": [],
      "created_at": "2026-03-11T14:27:00+02:00",
      "updated_at": "2026-03-11T14:27:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "created_at": "2026-03-11T14:27:00+02:00"
}

## ─── appointments.json ───
# type: "checkup" | "vaccination" | "specialist" | "emergency" | "other"
# status: "scheduled" | "completed" | "cancelled" | "missed"
{
  "appointments": [
    {
      "id": "apt_001",
      "person_id": "lia",
      "title": "ביקור חודש בטיפת חלב",
      "title_en": "1-month well baby visit",
      "type": "checkup",
      "type_he": "בדיקה",
      "status": "scheduled",
      "status_he": "מתוכנן",
      "date_time": "2026-04-09T10:00:00+02:00",
      "location": "טיפת חלב — רחובות",
      "provider": "אחות",
      "prep_tasks": ["להביא פנקס חיסונים"],
      "summary": null,
      "notes": "",
      "created_at": "2026-03-12T00:00:00+02:00"
    }
  ],
  "schema_version": "1.0",
  "created_at": "2026-03-11T14:27:00+02:00"
}

# ═══════════════════════════════════════════════════════
# DERIVED FILES — MUST be recomputed from raw data after every update
# CRITICAL: COUNT from the actual raw file arrays. Do NOT hardcode values.
# ═══════════════════════════════════════════════════════

## ─── derived/dashboard_today.json ───
# This is the MAIN dashboard. The app renders summary_cards directly.
# You MUST count feeding_log entries, diaper_log entries, etc. for today's date.
{
  "schema_version": "1.0",
  "date": "2026-03-12",
  "created_at": "2026-03-12T14:00:00+02:00",
  "summary_cards": [
    {
      "id": "baby_feeding",
      "title_he": "האכלות היום",
      "title_en": "Feedings Today",
      "value": 5,
      "unit_he": "האכלות",
      "unit_en": "feedings",
      "subtitle_he": "3 הנקות · 2 בקבוקים",
      "subtitle_en": "3 nursing, 2 bottles",
      "icon": "🍼",
      "status": "normal"
    },
    {
      "id": "baby_sleep",
      "title_he": "שינה היום",
      "title_en": "Sleep Today",
      "value": 0,
      "unit_he": "דקות",
      "unit_en": "minutes",
      "subtitle_he": "אין נתוני שינה",
      "subtitle_en": "No sleep data",
      "icon": "😴",
      "status": "warning"
    },
    {
      "id": "baby_diapers",
      "title_he": "חיתולים היום",
      "title_en": "Diapers Today",
      "value": 1,
      "unit_he": "חיתולים",
      "unit_en": "diapers",
      "subtitle_he": "1 קקי+פיפי",
      "subtitle_en": "1 both",
      "icon": "🧷",
      "status": "normal"
    },
    {
      "id": "mother_recovery",
      "title_he": "החלמת אמא",
      "title_en": "Mother Recovery",
      "value": "יום 3",
      "unit_he": "",
      "unit_en": "",
      "subtitle_he": "יום 3 אחרי לידה",
      "subtitle_en": "Day 3 postpartum",
      "icon": "💜",
      "status": "normal"
    }
  ],
  "chart_series": {
    "feedings_24h": [
      { "hour": "01:00", "count": 1, "type": "nursing" },
      { "hour": "13:00", "count": 1, "type": "bottle" },
      { "hour": "16:00", "count": 1, "type": "bottle" },
      { "hour": "19:00", "count": 1, "type": "nursing" },
      { "hour": "23:00", "count": 1, "type": "nursing" }
    ]
  },
  "last_events": {
    "last_feeding": "2026-03-12T01:20:00+02:00",
    "last_diaper": "2026-03-11T16:00:00+02:00",
    "last_sleep_end": null
  }
}

## ─── derived/baby_daily_metrics.json ───
# MUST have nested "metrics" object. The app reads metrics.feeding, metrics.diapers, etc.
{
  "schema_version": "1.0",
  "person_id": "lia",
  "date": "2026-03-12",
  "created_at": "2026-03-12T14:00:00+02:00",
  "metrics": {
    "feeding": {
      "total_count": 5,
      "nursing_count": 3,
      "bottle_count": 2,
      "total_nursing_minutes": 100,
      "total_bottle_ml": 60,
      "avg_gap_hours": 2.5,
      "longest_gap_hours": 4,
      "last_feeding_time": "2026-03-12T01:20:00+02:00",
      "minutes_since_last_feeding": 15
    },
    "diapers": {
      "total_count": 1,
      "wet_count": 0,
      "dirty_count": 0,
      "both_count": 1,
      "last_diaper_time": "2026-03-11T16:00:00+02:00",
      "hours_since_last_diaper": 9.5
    },
    "sleep": {
      "total_naps": 0,
      "total_sleep_minutes": 0,
      "longest_sleep_minutes": 0,
      "last_sleep_time": null
    },
    "health": {
      "temperature_readings": 0,
      "weight_readings": 0,
      "medications_given": 0
    }
  },
  "summary_he": "5 האכלות (3 הנקות, 2 בקבוקים), חיתול 1",
  "summary_en": "5 feedings (3 nursing, 2 bottles), 1 diaper"
}

## ─── derived/alerts_open.json ───
# severity: "info" | "warning" | "critical"
{
  "schema_version": "1.0",
  "created_at": "2026-03-12T14:00:00+02:00",
  "alerts": [
    {
      "id": "alert_001",
      "alert_type": "missing_vitamin_d",
      "severity": "warning",
      "person_id": "lia",
      "title_he": "חסר רישום ויטמין D",
      "title_en": "Missing Vitamin D",
      "message_he": "לא נרשם מתן ויטמין D היום לתינוקת",
      "message_en": "Vitamin D not recorded today",
      "action_required": true,
      "dismissed": false,
      "timestamp": "2026-03-12T14:00:00+02:00"
    }
  ],
  "summary": { "total": 1, "critical": 0, "warning": 1, "info": 0 }
}

## ─── derived/mother_recovery_metrics.json ───
# MUST have nested "metrics" object matching this schema.
{
  "schema_version": "1.0",
  "person_id": "zohar",
  "date": "2026-03-12",
  "created_at": "2026-03-12T14:00:00+02:00",
  "days_postpartum": 3,
  "metrics": {
    "hydration": {
      "glasses_today": 7,
      "goal": 10,
      "adherence_percent": 70
    },
    "supplements": {
      "taken": ["ברזל", "ויטמין D", "סידן"],
      "missed": ["אומגה 3"],
      "adherence_percent": 75
    },
    "sleep": {
      "hours_today": 5.5,
      "quality": "fair",
      "quality_he": "סבירה"
    },
    "mood": {
      "rating": 3,
      "max": 5
    },
    "energy": {
      "rating": 3,
      "max": 5
    },
    "symptoms": ["עייפות"],
    "nursing": {
      "total_sessions": 3,
      "total_minutes": 100,
      "avg_duration_minutes": 33
    }
  },
  "summary_he": "יום 3 אחרי לידה, 3 הנקות, שתייה 7/10",
  "summary_en": "Day 3 postpartum, 3 nursing sessions, hydration 7/10"
}

## ─── derived/family_task_metrics.json ───
{
  "schema_version": "1.0",
  "date": "2026-03-12",
  "created_at": "2026-03-12T14:00:00+02:00",
  "metrics": {
    "total": 2,
    "by_status": { "todo": 1, "in_progress": 1, "done": 0, "cancelled": 0 },
    "by_priority": { "critical": 0, "high": 1, "medium": 1, "low": 0 },
    "by_category": { "logistics": 1, "shopping": 1 },
    "overdue": 0
  },
  "summary_he": "2 משימות פעילות, 0 באיחור",
  "summary_en": "2 active tasks, 0 overdue"
}

## ─── derived/timeline_flat.json ───
# Merge ALL events from feeding, diapers, sleep, health into one sorted timeline.
# event_type: "feeding" | "diaper" | "sleep" | "health" | "medication" | "appointment" | "task"
{
  "schema_version": "1.0",
  "created_at": "2026-03-12T14:00:00+02:00",
  "entries": [
    {
      "id": "tl_001",
      "event_type": "feeding",
      "source_id": "feed_005",
      "person_id": "lia",
      "person_name": "ליה",
      "timestamp": "2026-03-12T01:20:00+02:00",
      "date": "2026-03-12",
      "time": "01:20",
      "title_he": "הנקה",
      "title_en": "Nursing",
      "subtitle_he": "שני הצדדים",
      "subtitle_en": "Both sides",
      "icon": "🍼"
    },
    {
      "id": "tl_002",
      "event_type": "diaper",
      "source_id": "diaper_001",
      "person_id": "lia",
      "person_name": "ליה",
      "timestamp": "2026-03-11T16:00:00+02:00",
      "date": "2026-03-11",
      "time": "16:00",
      "title_he": "קקי + פיפי",
      "title_en": "Both",
      "subtitle_he": "",
      "subtitle_en": "",
      "icon": "🧷"
    }
  ]
}

# ═══════════════════════════════════════════════════════
# HOW TO REGENERATE DERIVED FILES
# ═══════════════════════════════════════════════════════
#
# After adding/updating ANY entry in feeding.json, diapers.json, sleep.json,
# health.json, recovery.json, tasks.json, or appointments.json:
#
# 1. Read ALL raw files
# 2. Count today's entries from each feeding_log, diaper_log, sleep_log
# 3. Rebuild derived/dashboard_today.json with accurate summary_cards
# 4. Rebuild derived/baby_daily_metrics.json with accurate metrics
# 5. Rebuild derived/mother_recovery_metrics.json from recovery_log
# 6. Rebuild derived/family_task_metrics.json from tasks
# 7. Rebuild derived/alerts_open.json (check for missing meds, long gaps, etc.)
# 8. Rebuild derived/timeline_flat.json by merging all events chronologically
# 9. Update indexes/latest_state.json
#
# COMMON MISTAKES TO AVOID:
# - DO NOT use a flat dashboard format like {"feedings": 1, "diapers": 1}
#   USE the summary_cards array format shown above
# - DO NOT use flat baby_daily_metrics like {"feedings_count": 1}
#   USE the nested metrics.feeding.total_count format shown above
# - DO NOT guess counts — ALWAYS read and count from the raw arrays
# - DO NOT forget to update updated_at timestamps
# - DO NOT use "baby_1" as person_id — use "lia"
