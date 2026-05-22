"""
MindBridge PPTX Generator
Creates a professional 20-slide PowerPoint presentation from PRESENTATION_SLIDES.md
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import copy

OUTPUT = r'C:\Users\bigchella\Downloads\MindBridge_Complete_Project\MindBridge_Project\MindBridge_Presentation.pptx'

# ── Brand colours ─────────────────────────────────────────────────────────────
BLUE_DARK   = RGBColor(0x2E, 0x50, 0x90)   # #2E5090
BLUE_MID    = RGBColor(0x1F, 0x38, 0x6B)   # #1F386B  (darker for header BG)
BLUE_LIGHT  = RGBColor(0xD0, 0xDC, 0xF0)   # #D0DCF0  (light tint)
ACCENT      = RGBColor(0x00, 0xB0, 0x80)   # #00B080  (teal green)
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
BLACK       = RGBColor(0x00, 0x00, 0x00)
GREY_DARK   = RGBColor(0x33, 0x33, 0x33)
GREY_LIGHT  = RGBColor(0xF5, 0xF5, 0xF5)
YELLOW      = RGBColor(0xFF, 0xC0, 0x00)

# ── Slide size: Widescreen 16:9 ───────────────────────────────────────────────
W = Inches(13.33)
H = Inches(7.5)

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

# ── Helper: solid fill shape ─────────────────────────────────────────────────
def fill_solid(shape, rgb):
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb

def no_fill(shape):
    shape.fill.background()

def no_line(shape):
    shape.line.fill.background()

# ── Helper: add rectangle ─────────────────────────────────────────────────────
def add_rect(slide, l, t, w, h, rgb):
    s = slide.shapes.add_shape(1, l, t, w, h)  # MSO_SHAPE_TYPE.RECTANGLE = 1
    fill_solid(s, rgb)
    no_line(s)
    return s

# ── Helper: add text box ──────────────────────────────────────────────────────
def add_textbox(slide, l, t, w, h, text, size, bold=False, color=BLACK,
                align=PP_ALIGN.LEFT, italic=False, wrap=True, font='Arial'):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return tb

# ── Helper: add styled title bar ─────────────────────────────────────────────
def add_title_bar(slide, title_text):
    """Dark blue band at top with white title text."""
    bar = add_rect(slide, 0, 0, W, Inches(1.25), BLUE_MID)
    add_textbox(slide, Inches(0.4), Inches(0.18), Inches(12.5), Inches(0.9),
                title_text, 28, bold=True, color=WHITE, align=PP_ALIGN.LEFT)
    # Thin accent line at bottom of bar
    line = add_rect(slide, 0, Inches(1.25), W, Inches(0.06), ACCENT)

def add_footer(slide, left_text='MindBridge | SEN3244 | ICT University of Cameroon | Spring 2026'):
    """Subtle footer strip."""
    add_rect(slide, 0, H - Inches(0.35), W, Inches(0.35), BLUE_DARK)
    add_textbox(slide, Inches(0.3), H - Inches(0.33), Inches(12.0), Inches(0.3),
                left_text, 8, color=WHITE, align=PP_ALIGN.LEFT)

def blank_slide():
    layout = prs.slide_layouts[6]  # blank
    return prs.slides.add_slide(layout)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 1 — Title
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
# Full blue background
add_rect(sl, 0, 0, W, H, BLUE_DARK)
# Accent diagonal strip (decorative)
add_rect(sl, 0, H - Inches(1.5), W, Inches(1.5), BLUE_MID)
add_rect(sl, 0, H - Inches(0.4), W, Inches(0.4), ACCENT)

# Title
add_textbox(sl, Inches(1), Inches(1.3), Inches(11), Inches(1.4),
            'MINDBRIDGE', 64, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(1), Inches(2.55), Inches(11), Inches(0.7),
            'A Privacy-First Campus Mental Health Platform', 24,
            italic=True, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Divider
add_rect(sl, Inches(3), Inches(3.3), Inches(7.33), Inches(0.06), ACCENT)

add_textbox(sl, Inches(1), Inches(3.5), Inches(11), Inches(0.45),
            'SEN3244 — Software Architecture  |  ICT University of Cameroon  |  Spring 2026',
            15, color=WHITE, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(1), Inches(3.95), Inches(11), Inches(0.4),
            'Supervisor: Engr. TEKOH PALMA', 14, italic=True, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Team box
tb_box = add_rect(sl, Inches(3.5), Inches(4.6), Inches(6.33), Inches(1.7), BLUE_MID)
add_textbox(sl, Inches(3.6), Inches(4.7), Inches(6.1), Inches(0.35),
            'Team', 13, bold=True, color=ACCENT, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(3.6), Inches(5.05), Inches(6.1), Inches(1.1),
            'EBODE ADA ERIKA ALEXANDRA  (ICTU20233909)  —  Team Leader\nAJA CHELLA ASAMBA JR  (ICTU20233787)  —  Developer & DevOps',
            12, color=WHITE, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 2 — The Problem
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'The Problem')

# Stat highlight
stat_box = add_rect(sl, Inches(0.4), Inches(1.4), Inches(5.6), Inches(1.1), BLUE_DARK)
add_textbox(sl, Inches(0.5), Inches(1.45), Inches(5.4), Inches(0.45),
            '34%', 36, bold=True, color=YELLOW, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(0.5), Inches(1.9), Inches(5.4), Inches(0.45),
            'of African university students meet criteria for a mental health disorder',
            10, color=WHITE, align=PP_ALIGN.CENTER)

add_textbox(sl, Inches(0.4), Inches(2.65), Inches(12.5), Inches(0.4),
            'Yet only 8% ever seek help — why?', 18, bold=True, color=BLUE_DARK)

problems = [
    'Visiting a counselor carries social stigma',
    'No anonymous way to express distress',
    'No system tracks student wellness over time',
    'No mechanism for discreet crisis escalation',
    'Zero support available evenings and weekends',
]
for i, p in enumerate(problems):
    y = Inches(3.1) + i * Inches(0.62)
    # Red X bullet
    add_rect(sl, Inches(0.4), y + Inches(0.08), Inches(0.3), Inches(0.3), RGBColor(0xCC, 0x22, 0x22))
    add_textbox(sl, Inches(0.42), y + Inches(0.03), Inches(0.28), Inches(0.35),
                '✕', 14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_textbox(sl, Inches(0.85), y, Inches(11.5), Inches(0.5),
                p, 16, color=GREY_DARK)

add_textbox(sl, Inches(0.4), Inches(6.3), Inches(12.5), Inches(0.5),
            '"Students suffer in silence because the tools don\'t exist."',
            14, italic=True, color=BLUE_DARK, align=PP_ALIGN.CENTER)
add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 3 — Our Solution
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Our Solution: MindBridge')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(12.5), Inches(0.4),
            'One platform. Six features. Complete privacy.', 16, bold=True, color=BLUE_DARK)

features = [
    ('📊', 'Daily Mood Check-in',  'Anonymous 1–5 mood + energy score'),
    ('📓', 'Private Journal',       'Encrypted entries — admins NEVER see'),
    ('💬', 'Anonymous Forum',       'Post as "Teal Sparrow" — no one knows it\'s you'),
    ('🆘', 'Crisis Flag',           'Alert counselors without revealing your identity'),
    ('📚', 'Resource Library',      'Articles, breathing exercises, hotlines'),
    ('🤖', 'MindBot AI',            '24/7 empathetic AI companion (Claude API)'),
]
col_w = Inches(2.1)
for i, (icon, name, desc) in enumerate(features):
    col = i % 3
    row = i // 3
    x = Inches(0.3) + col * Inches(4.35)
    y = Inches(1.9) + row * Inches(1.85)
    box = add_rect(sl, x, y, Inches(4.1), Inches(1.7), BLUE_LIGHT)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.1), Inches(3.8), Inches(0.55),
                icon + '  ' + name, 15, bold=True, color=BLUE_DARK)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.65), Inches(3.8), Inches(0.85),
                desc, 12, color=GREY_DARK)

add_rect(sl, 0, H - Inches(0.7), W, Inches(0.35), BLUE_DARK)
add_textbox(sl, Inches(0.3), H - Inches(0.68), Inches(12.7), Inches(0.3),
            'Core principle: Privacy enforced at the DATA LAYER — not just policy.',
            12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 4 — Architecture Overview
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Architecture Overview')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(7), Inches(0.4),
            '5-Layer N-Tier Hybrid Architecture', 16, bold=True, color=BLUE_DARK)

layers = [
    ('Layer 1', 'PRESENTATION',    'React 18 + TypeScript SPA',      BLUE_DARK),
    ('Layer 2', 'API / ROUTES',    'FastAPI + JWT + RBAC',           RGBColor(0x3A, 0x6E, 0xB8)),
    ('Layer 3', 'BUSINESS LOGIC',  'Services (7 domain modules)',    RGBColor(0x4A, 0x8E, 0xCC)),
    ('Layer 4', 'DATA ACCESS',     'SQLAlchemy ORM 2.0',             RGBColor(0x5A, 0xAE, 0xE0)),
    ('Layer 5', 'DATABASE',        'PostgreSQL 15',                  RGBColor(0x6A, 0xCE, 0xF4)),
]
bar_h = Inches(0.82)
bar_w = Inches(7.2)
for i, (lbl, name, tech, col) in enumerate(layers):
    y = Inches(1.9) + i * (bar_h + Inches(0.06))
    add_rect(sl, Inches(0.4), y, bar_w, bar_h, col)
    add_textbox(sl, Inches(0.55), y + Inches(0.05), Inches(1.0), Inches(0.38),
                lbl, 10, bold=True, color=BLUE_LIGHT)
    add_textbox(sl, Inches(0.55), y + Inches(0.38), Inches(2.8), Inches(0.35),
                name, 13, bold=True, color=WHITE)
    add_textbox(sl, Inches(3.4), y + Inches(0.22), Inches(4.0), Inches(0.4),
                tech, 13, color=WHITE)

# Right panel — why N-Tier?
add_rect(sl, Inches(8.0), Inches(1.38), Inches(5.0), Inches(5.7), GREY_LIGHT)
add_textbox(sl, Inches(8.15), Inches(1.5), Inches(4.7), Inches(0.4),
            'Why N-Tier?', 15, bold=True, color=BLUE_DARK)
reasons = [
    'Simpler than microservices for a\n4-person, 8-week project',
    'Each layer independently testable\n→ achieved 81.84% coverage',
    'Clear separation of concerns:\nRoutes | Services | Models',
    'Combined with Client-Server, SOA,\nand Jenkins Pipeline patterns',
]
for i, r in enumerate(reasons):
    y = Inches(2.0) + i * Inches(1.2)
    add_rect(sl, Inches(8.15), y, Inches(0.06), Inches(0.8), ACCENT)
    add_textbox(sl, Inches(8.3), y, Inches(4.5), Inches(1.0), r, 12, color=GREY_DARK)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 5 — Component Diagram
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'System Component Diagram')

# Draw ASCII-style component boxes
components = [
    (Inches(0.3), Inches(2.0), Inches(2.4), Inches(1.1), 'React SPA\n(TypeScript)', BLUE_LIGHT, BLUE_DARK),
    (Inches(0.3), Inches(3.5), Inches(2.4), Inches(1.1), 'Nginx Ingress\n(K8s)', BLUE_LIGHT, BLUE_DARK),
    (Inches(3.2), Inches(2.0), Inches(2.6), Inches(1.1), 'FastAPI\n(×2 pods)', BLUE_DARK, WHITE),
    (Inches(3.2), Inches(3.5), Inches(2.6), Inches(1.1), 'PostgreSQL\n(PVC 5Gi)', RGBColor(0x33, 0x66, 0x99), WHITE),
    (Inches(6.4), Inches(2.0), Inches(2.4), Inches(1.1), 'Anthropic\nClaude API', RGBColor(0x20, 0x80, 0x60), WHITE),
    (Inches(6.4), Inches(3.5), Inches(2.4), Inches(1.1), 'Prometheus\n+ Grafana', RGBColor(0xE0, 0x60, 0x00), WHITE),
    (Inches(9.3), Inches(2.0), Inches(2.4), Inches(1.1), 'Jenkins\nCI/CD', RGBColor(0xCC, 0x44, 0x44), WHITE),
    (Inches(9.3), Inches(3.5), Inches(2.4), Inches(1.1), 'Google\nOAuth 2.0', RGBColor(0x44, 0x80, 0x44), WHITE),
]
for x, y, w, h, text, bg, fg in components:
    add_rect(sl, x, y, w, h, bg)
    add_textbox(sl, x + Inches(0.1), y + Inches(0.2), w - Inches(0.2), h - Inches(0.3),
                text, 13, bold=True, color=fg, align=PP_ALIGN.CENTER)

# Arrows (simplified as thin rectangles)
def arrow_h(slide, x, y, length, color=GREY_DARK):
    add_rect(slide, x, y, length, Inches(0.04), color)

def arrow_v(slide, x, y, height, color=GREY_DARK):
    add_rect(slide, x, y, Inches(0.04), height, color)

# React → Nginx
arrow_h(sl, Inches(0.3) + Inches(2.4)/2 - Inches(0.02), Inches(3.5), Inches(0.04), BLUE_DARK)
arrow_v(sl, Inches(1.5), Inches(3.1), Inches(0.4))
# Nginx → FastAPI
arrow_h(sl, Inches(2.7), Inches(4.0), Inches(0.5))
# React → FastAPI
arrow_h(sl, Inches(2.7), Inches(2.5), Inches(0.5))
# FastAPI → PostgreSQL
arrow_v(sl, Inches(4.52), Inches(3.1), Inches(0.4))
# FastAPI → Claude
arrow_h(sl, Inches(5.8), Inches(2.5), Inches(0.6))
# FastAPI → Prometheus
arrow_h(sl, Inches(5.8), Inches(4.0), Inches(0.6))
# Jenkins (top)
arrow_h(sl, Inches(8.8), Inches(2.5), Inches(0.5))

# Key connections text
add_textbox(sl, Inches(0.3), Inches(5.0), Inches(12.7), Inches(0.35),
            'Key integrations: Anthropic Claude API (MindBot)  |  Google OAuth 2.0 (SSO)  |  Prometheus/Grafana (monitoring)  |  Jenkins (CI/CD)',
            12, color=BLUE_DARK, align=PP_ALIGN.CENTER)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 6 — Privacy Architecture
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Privacy Architecture (Key Innovation)')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(12.5), Inches(0.4),
            'How do you monitor campus wellness WITHOUT exposing individual students?', 14, italic=True, color=GREY_DARK)

layers_priv = [
    ('Layer 1', 'Pseudonymization',
     'anon_token = HMAC-SHA256(user_id, SECRET_KEY)\nMood logs stored with anon_token, never user_id.',
     BLUE_DARK),
    ('Layer 2', 'Structural Anonymization',
     'crisis_flags table has NO user_id column.\nIdentity linkage is architecturally impossible.',
     RGBColor(0x3A, 0x6E, 0xB8)),
    ('Layer 3', 'RBAC Enforcement',
     'Admin token on journal endpoint → 403 Forbidden.\nEnforced at service layer, not just API.',
     ACCENT),
]
for i, (lbl, title, detail, col) in enumerate(layers_priv):
    y = Inches(1.95) + i * Inches(1.55)
    add_rect(sl, Inches(0.3), y, Inches(12.7), Inches(1.35), col)
    add_textbox(sl, Inches(0.5), y + Inches(0.1), Inches(1.2), Inches(0.35),
                lbl, 10, bold=True, color=BLUE_LIGHT)
    add_textbox(sl, Inches(0.5), y + Inches(0.42), Inches(3.5), Inches(0.45),
                title, 16, bold=True, color=WHITE)
    add_textbox(sl, Inches(4.2), y + Inches(0.22), Inches(8.5), Inches(0.9),
                detail, 13, color=WHITE)

add_textbox(sl, Inches(0.3), Inches(6.65), Inches(12.7), Inches(0.4),
            'Result: Admin sees aggregate campus trends. Never individual identities.',
            14, bold=True, color=BLUE_DARK, align=PP_ALIGN.CENTER)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 7 — Database Design
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Database Design — 6 Tables')

headers = ['Table', 'Privacy Mechanism', 'Admin Visible?']
rows = [
    ['users',           'Source of truth — never joined to mood/crisis',      'Basic profile only'],
    ['mood_logs',       'anon_token (HMAC-SHA256) — no user_id column',        'Aggregate only'],
    ['journal_entries', 'user_id FK — API blocks all admin access → 403',       'NEVER'],
    ['forum_posts',     'anon_name ("Teal Sparrow") in all API responses',      'NEVER'],
    ['crisis_flags',    'NO user_id column — identity structurally impossible', 'NEVER'],
    ['resources',       'Public admin-curated library — no privacy concern',   'Full access'],
]

col_widths = [Inches(2.4), Inches(7.0), Inches(2.9)]
col_x = [Inches(0.3), Inches(2.7), Inches(9.7)]
row_h = Inches(0.72)
header_y = Inches(1.45)

# Header row
for j, (hdr, cx, cw) in enumerate(zip(headers, col_x, col_widths)):
    add_rect(sl, cx, header_y, cw - Inches(0.06), row_h, BLUE_DARK)
    add_textbox(sl, cx + Inches(0.1), header_y + Inches(0.18), cw - Inches(0.2), Inches(0.35),
                hdr, 13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

for i, row in enumerate(rows):
    y = header_y + row_h + i * row_h
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    never_flag = 'NEVER' in row[2]
    for j, (cell, cx, cw) in enumerate(zip(row, col_x, col_widths)):
        add_rect(sl, cx, y, cw - Inches(0.06), row_h - Inches(0.04), bg)
        cell_color = RGBColor(0xCC, 0x22, 0x22) if (j == 2 and never_flag) else GREY_DARK
        cell_bold = (j == 2 and never_flag)
        cell_font = 'Courier New' if j == 0 else 'Arial'
        add_textbox(sl, cx + Inches(0.1), y + Inches(0.14), cw - Inches(0.2), Inches(0.5),
                    cell, 11, bold=cell_bold, color=cell_color, font=cell_font)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 8 — Scrum Process
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Scrum Process — 2 Sprints, 93 Story Points')

# Sprint table
headers_s = ['Sprint', 'Goal', 'Points', 'Result']
rows_s = [
    ['Sprint 1', 'Auth + Wellness features (Mood, Journal, Forum)', '36', 'DELIVERED 36/36'],
    ['Sprint 2', 'Admin + AI + DevOps + Testing', '54', 'DELIVERED 54/54'],
    ['TOTAL', '4 weeks | 2 team ceremonies/week', '93', '100% complete'],
]
col_w_s = [Inches(1.4), Inches(7.0), Inches(1.4), Inches(2.8)]
col_x_s = [Inches(0.3), Inches(1.7), Inches(8.7), Inches(10.1)]
rh = Inches(0.72)
hy = Inches(1.5)

for j, (hdr, cx, cw) in enumerate(zip(headers_s, col_x_s, col_w_s)):
    add_rect(sl, cx, hy, cw - Inches(0.06), rh, BLUE_DARK)
    add_textbox(sl, cx + Inches(0.08), hy + Inches(0.18), cw - Inches(0.16), Inches(0.35),
                hdr, 13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

for i, row in enumerate(rows_s):
    y = hy + rh + i * rh
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    for j, (cell, cx, cw) in enumerate(zip(row, col_x_s, col_w_s)):
        add_rect(sl, cx, y, cw - Inches(0.06), rh - Inches(0.04), bg)
        is_delivered = 'DELIVERED' in cell
        ccol = ACCENT if is_delivered else GREY_DARK
        add_textbox(sl, cx + Inches(0.08), y + Inches(0.14), cw - Inches(0.16), Inches(0.5),
                    cell, 12, bold=is_delivered, color=ccol, align=PP_ALIGN.CENTER if j in [0,2,3] else PP_ALIGN.LEFT)

# Velocity stat
add_rect(sl, Inches(0.3), Inches(4.45), Inches(3.8), Inches(1.1), BLUE_DARK)
add_textbox(sl, Inches(0.4), Inches(4.55), Inches(3.6), Inches(0.45),
            '45 pts', 32, bold=True, color=YELLOW, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(0.4), Inches(4.95), Inches(3.6), Inches(0.4),
            'average velocity per sprint', 12, color=WHITE, align=PP_ALIGN.CENTER)

# Retrospective note
add_rect(sl, Inches(4.5), Inches(4.45), Inches(8.5), Inches(1.7), GREY_LIGHT)
add_textbox(sl, Inches(4.65), Inches(4.55), Inches(8.2), Inches(0.35),
            'Sprint Retrospective Insight', 13, bold=True, color=BLUE_DARK)
add_textbox(sl, Inches(4.65), Inches(4.9), Inches(8.2), Inches(1.0),
            'Both sprints were back-loaded — complex DevOps stories took longer to start.\nAction item: spike infrastructure tasks FIRST in next sprint.\nCeremonies: Sprint Planning, Daily Stand-up, Review, Retrospective.',
            12, color=GREY_DARK)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 9 — Testing Results
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Testing Results')

# Big stat
add_rect(sl, Inches(0.3), Inches(1.45), Inches(4.0), Inches(1.7), BLUE_DARK)
add_textbox(sl, Inches(0.4), Inches(1.55), Inches(3.8), Inches(0.7),
            '81.84%', 40, bold=True, color=YELLOW, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(0.4), Inches(2.2), Inches(3.8), Inches(0.4),
            'Test Coverage (target: 80%)', 13, color=WHITE, align=PP_ALIGN.CENTER)

add_rect(sl, Inches(4.5), Inches(1.45), Inches(2.8), Inches(1.7), ACCENT)
add_textbox(sl, Inches(4.6), Inches(1.55), Inches(2.6), Inches(0.7),
            '65', 48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(4.6), Inches(2.2), Inches(2.6), Inches(0.4),
            'Tests Passed', 13, color=WHITE, align=PP_ALIGN.CENTER)

add_rect(sl, Inches(7.5), Inches(1.45), Inches(2.0), Inches(1.7), RGBColor(0x33, 0x99, 0x33))
add_textbox(sl, Inches(7.6), Inches(1.55), Inches(1.8), Inches(0.7),
            '0', 48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_textbox(sl, Inches(7.6), Inches(2.2), Inches(1.8), Inches(0.4),
            'Failed', 13, color=WHITE, align=PP_ALIGN.CENTER)

# Test breakdown table
test_rows = [
    ['test_auth.py',      '13', 'Register, login, JWT, profile'],
    ['test_mood.py',      '11', 'Check-in, history, trends, privacy'],
    ['test_journal.py',   '8',  'CRUD, admin blocked, cross-user blocked'],
    ['test_forum.py',     '11', 'Posts, replies, moderation, anonymity'],
    ['test_crisis.py',    '10', 'Submission, admin alerts, resolution'],
    ['test_resources.py', '12', 'Listing, admin CRUD, categories'],
]
col_w_t = [Inches(2.8), Inches(1.0), Inches(8.0)]
col_x_t = [Inches(0.3), Inches(3.1), Inches(4.1)]
rh = Inches(0.56)
hy = Inches(3.3)

hdrs = ['File', 'Tests', 'Focus']
for j, (hdr, cx, cw) in enumerate(zip(hdrs, col_x_t, col_w_t)):
    add_rect(sl, cx, hy, cw - Inches(0.04), rh, BLUE_DARK)
    add_textbox(sl, cx + Inches(0.08), hy + Inches(0.1), cw - Inches(0.16), Inches(0.35),
                hdr, 12, bold=True, color=WHITE, align=PP_ALIGN.CENTER if j == 1 else PP_ALIGN.LEFT)

for i, row in enumerate(test_rows):
    y = hy + rh + i * rh
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    for j, (cell, cx, cw) in enumerate(zip(row, col_x_t, col_w_t)):
        add_rect(sl, cx, y, cw - Inches(0.04), rh - Inches(0.02), bg)
        add_textbox(sl, cx + Inches(0.08), y + Inches(0.1), cw - Inches(0.16), Inches(0.4),
                    cell, 11, color=GREY_DARK,
                    font='Courier New' if j == 0 else 'Arial',
                    align=PP_ALIGN.CENTER if j == 1 else PP_ALIGN.LEFT)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 10 — CI/CD Pipeline
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'CI/CD Pipeline — 9-Stage Jenkins')

stages = [
    ('1', 'Checkout',      'Clone repo'),
    ('2', 'Build',         'pip install + npm install'),
    ('3', 'Lint',          'flake8 + eslint (parallel)'),
    ('4', 'Test',          'pytest --cov-fail-under=80'),
    ('5', 'Security Scan', 'bandit (HIGH → fail)'),
    ('6', 'Docker Build',  'API + Frontend images (parallel)'),
    ('7', 'Docker Push',   'main branch only'),
    ('8', 'Deploy',        'kubectl rollout restart'),
    ('9', 'Notify',        'success / failure notification'),
]
s_w = Inches(1.35)
s_h = Inches(0.9)
s_gap = Inches(0.08)
s_y = Inches(1.55)
for i, (num, name, detail) in enumerate(stages):
    x = Inches(0.25) + i * (s_w + s_gap)
    col = BLUE_DARK if i < 5 else RGBColor(0x1F, 0x70, 0x50)
    add_rect(sl, x, s_y, s_w, s_h, col)
    add_textbox(sl, x + Inches(0.05), s_y + Inches(0.04), s_w - Inches(0.1), Inches(0.3),
                num, 16, bold=True, color=YELLOW, align=PP_ALIGN.CENTER)
    add_textbox(sl, x + Inches(0.04), s_y + Inches(0.32), s_w - Inches(0.08), Inches(0.35),
                name, 9, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_textbox(sl, x + Inches(0.04), s_y + Inches(0.62), s_w - Inches(0.08), Inches(0.28),
                detail, 8, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Arrow strip
add_rect(sl, Inches(0.25), s_y + s_h + Inches(0.04), Inches(12.83), Inches(0.1), ACCENT)

# Gate boxes
add_rect(sl, Inches(0.3), Inches(2.8), Inches(5.9), Inches(0.9), GREY_LIGHT)
add_textbox(sl, Inches(0.45), Inches(2.85), Inches(5.6), Inches(0.35),
            'Test Gate (Stage 4)', 13, bold=True, color=BLUE_DARK)
add_textbox(sl, Inches(0.45), Inches(3.15), Inches(5.6), Inches(0.4),
            'Build FAILS if test coverage < 80%', 12, color=GREY_DARK)

add_rect(sl, Inches(6.5), Inches(2.8), Inches(6.6), Inches(0.9), GREY_LIGHT)
add_textbox(sl, Inches(6.65), Inches(2.85), Inches(6.3), Inches(0.35),
            'Security Gate (Stage 5)', 13, bold=True, color=BLUE_DARK)
add_textbox(sl, Inches(6.65), Inches(3.15), Inches(6.3), Inches(0.4),
            'Build FAILS if Bandit finds HIGH severity issues', 12, color=GREY_DARK)

# Jenkinsfile code sample
add_rect(sl, Inches(0.3), Inches(3.85), Inches(12.7), Inches(2.8), RGBColor(0x1E, 0x1E, 0x1E))
code = (
    "pipeline {\n"
    "  agent any\n"
    "  stages {\n"
    "    stage('Test') { steps { sh 'pytest --cov=app --cov-fail-under=80' } }\n"
    "    stage('Security') { steps { sh 'bandit -r app/ -ll -ii' } }\n"
    "    stage('Docker Build') { parallel {\n"
    "      stage('API') { steps { sh 'docker build -t mindbridge-api .' } }\n"
    "      stage('Frontend') { steps { sh 'docker build -t mindbridge-frontend frontend/' } }\n"
    "    }}\n"
    "    stage('Deploy') { when { branch 'main' }\n"
    "      steps { sh 'kubectl rollout restart deployment/mindbridge-api -n mindbridge' } }\n"
    "  }\n"
    "}"
)
add_textbox(sl, Inches(0.5), Inches(3.9), Inches(12.3), Inches(2.7),
            code, 9, color=RGBColor(0xAA, 0xDD, 0xFF), font='Courier New')

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 11 — Kubernetes Deployment
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Kubernetes Deployment — 8 Manifest Files')

manifests = [
    ('namespace.yaml',      'mindbridge namespace isolation'),
    ('pvc.yaml',            'PostgreSQL PersistentVolumeClaim (5Gi)'),
    ('ingress.yaml',        'Nginx Ingress + ConfigMap + Secrets'),
    ('service.yaml',        'ClusterIP services + PostgreSQL deployment'),
    ('deployment.yaml',     'API — 2 replicas, rolling update, initContainer'),
    ('frontend.yaml',       'Frontend — 2 replicas + service'),
    ('hpa.yaml',            'HorizontalPodAutoscaler: 2–8 pods, CPU > 70%'),
    ('networkpolicy.yaml',  'DB accessible only from API pods'),
]
for i, (fn, desc) in enumerate(manifests):
    col = i % 2
    row = i // 2
    x = Inches(0.3) + col * Inches(6.5)
    y = Inches(1.52) + row * Inches(1.08)
    add_rect(sl, x, y, Inches(6.2), Inches(0.95), BLUE_LIGHT)
    add_textbox(sl, x + Inches(0.12), y + Inches(0.07), Inches(5.9), Inches(0.35),
                fn, 13, bold=True, color=BLUE_DARK, font='Courier New')
    add_textbox(sl, x + Inches(0.12), y + Inches(0.5), Inches(5.9), Inches(0.35),
                desc, 12, color=GREY_DARK)

# Deploy command
add_rect(sl, Inches(0.3), Inches(5.85), Inches(12.7), Inches(1.0), RGBColor(0x1E, 0x1E, 0x1E))
add_textbox(sl, Inches(0.5), Inches(5.92), Inches(12.3), Inches(0.85),
            '# One-command deploy\nkubectl apply -k mindbridge-backend/k8s/\n# OR: bash mindbridge-backend/k8s/deploy.sh',
            12, color=RGBColor(0xAA, 0xDD, 0xFF), font='Courier New')

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 12 — Monitoring
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Monitoring — Prometheus + Grafana')

panels = [
    ('Total Requests',      'http_requests_total counter'),
    ('Error Rate (%)',       '5xx / total × 100'),
    ('Response Time p95',   'http_request_duration_seconds histogram'),
    ('Running Replicas',    'kube_deployment_status_replicas'),
    ('Requests/Endpoint',   'Top routes by req/min'),
    ('Latency Heatmap',     'p50 / p95 / p99 comparison'),
]
pw = Inches(4.0)
ph = Inches(1.3)
for i, (name, metric) in enumerate(panels):
    col = i % 3
    row = i // 3
    x = Inches(0.25) + col * (pw + Inches(0.2))
    y = Inches(1.52) + row * (ph + Inches(0.25))
    add_rect(sl, x, y, pw, ph, GREY_LIGHT)
    add_rect(sl, x, y, pw, Inches(0.08), ACCENT)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.12), pw - Inches(0.3), Inches(0.4),
                name, 14, bold=True, color=BLUE_DARK)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.6), pw - Inches(0.3), Inches(0.5),
                metric, 11, color=GREY_DARK, font='Courier New')

# Alert rules
add_rect(sl, Inches(0.25), Inches(4.55), Inches(12.8), Inches(1.6), BLUE_DARK)
add_textbox(sl, Inches(0.4), Inches(4.65), Inches(12.4), Inches(0.4),
            'Alert Rules Configured:', 13, bold=True, color=WHITE)
alerts = 'Error rate > 5% → Critical  |  p95 latency > 2s → Warning  |  Replicas < 2 → Critical  |  Crisis flags > 10/hour → Warning (surge detection)'
add_textbox(sl, Inches(0.4), Inches(5.05), Inches(12.4), Inches(0.9),
            alerts, 12, color=BLUE_LIGHT)
add_textbox(sl, Inches(0.4), Inches(6.3), Inches(12.4), Inches(0.35),
            'Grafana: http://localhost:3001  (admin / mindbridge123)  |  Prometheus: http://localhost:9090',
            11, color=RGBColor(0xBB, 0xBB, 0xBB))

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 13 — Ansible
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Ansible Configuration Management')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(12.5), Inches(0.4),
            '2 playbooks automate the entire VPS setup end-to-end', 14, italic=True, color=GREY_DARK)

pb_data = [
    ('install_dependencies.yml', 'Installs Docker, Python 3.11, Nginx on Ubuntu VPS\nConfigures UFW firewall (ports 22, 80, 443)\nSets up Docker systemd service'),
    ('deploy_app.yml',           'Templates .env from Jinja2 (.env.j2)\nPulls latest Docker images\nRuns docker compose up -d --build\nConfigures Nginx reverse proxy\nHealth-checks the deployment post-start'),
]
for i, (fname, details) in enumerate(pb_data):
    y = Inches(1.9) + i * Inches(2.2)
    add_rect(sl, Inches(0.3), y, Inches(12.7), Inches(2.0), GREY_LIGHT)
    add_rect(sl, Inches(0.3), y, Inches(12.7), Inches(0.08), ACCENT)
    add_textbox(sl, Inches(0.5), y + Inches(0.15), Inches(12.2), Inches(0.4),
                fname, 16, bold=True, color=BLUE_DARK, font='Courier New')
    add_textbox(sl, Inches(0.5), y + Inches(0.65), Inches(12.2), Inches(1.2),
                details, 13, color=GREY_DARK)

add_rect(sl, Inches(0.3), Inches(6.2), Inches(12.7), Inches(0.85), RGBColor(0x1E, 0x1E, 0x1E))
add_textbox(sl, Inches(0.5), Inches(6.28), Inches(12.2), Inches(0.65),
            'ansible-playbook -i inventory/hosts.ini playbooks/install_dependencies.yml playbooks/deploy_app.yml',
            12, color=RGBColor(0xAA, 0xDD, 0xFF), font='Courier New')

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 14 — MindBot AI
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'MindBot AI Companion — Innovation Feature')

# Left: tech details
add_textbox(sl, Inches(0.4), Inches(1.42), Inches(6.3), Inches(0.38),
            'Technology: Anthropic Claude API (claude-3-5-haiku)', 13, bold=True, color=BLUE_DARK)

add_rect(sl, Inches(0.3), Inches(1.9), Inches(6.4), Inches(2.5), GREY_LIGHT)
add_textbox(sl, Inches(0.45), Inches(2.0), Inches(6.1), Inches(0.35),
            'System Prompt Engineering', 12, bold=True, color=BLUE_DARK)
prompt_text = (
    '"You are MindBot, an empathetic AI wellness companion\n'
    'for university students. Listen without judgment.\n'
    'Suggest evidence-based coping strategies. Guide\n'
    'toward professional support when appropriate.\n'
    'Do NOT diagnose or replace therapy."'
)
add_textbox(sl, Inches(0.45), Inches(2.38), Inches(6.1), Inches(1.8),
            prompt_text, 12, italic=True, color=GREY_DARK, font='Courier New')

# Privacy note
add_rect(sl, Inches(0.3), Inches(4.55), Inches(6.4), Inches(0.8), BLUE_DARK)
add_textbox(sl, Inches(0.45), Inches(4.65), Inches(6.1), Inches(0.55),
            'Privacy: Conversations NOT stored server-side.\nClient sends full context per request. Zero retention.', 12, color=WHITE)

# Right: chat simulation
add_rect(sl, Inches(7.0), Inches(1.42), Inches(6.0), Inches(4.9), GREY_LIGHT)
add_textbox(sl, Inches(7.1), Inches(1.5), Inches(5.8), Inches(0.4),
            'Sample Conversation', 13, bold=True, color=BLUE_DARK, align=PP_ALIGN.CENTER)

# Student bubble
add_rect(sl, Inches(8.0), Inches(1.98), Inches(4.7), Inches(0.7), BLUE_LIGHT)
add_textbox(sl, Inches(8.1), Inches(2.04), Inches(4.5), Inches(0.55),
            'Student: "I\'m really stressed about finals"', 12, color=BLUE_DARK, italic=True)

# Bot bubble
add_rect(sl, Inches(7.1), Inches(2.85), Inches(5.6), Inches(1.7), ACCENT)
add_textbox(sl, Inches(7.2), Inches(2.92), Inches(5.35), Inches(1.5),
            'MindBot: "I hear you — exam pressure is real and valid.\nLet\'s try a quick grounding technique: name 5 things\nyou can see around you right now..."',
            12, color=WHITE)

# Second student
add_rect(sl, Inches(8.0), Inches(4.72), Inches(4.7), Inches(0.6), BLUE_LIGHT)
add_textbox(sl, Inches(8.1), Inches(4.78), Inches(4.5), Inches(0.45),
            'Student: "ok trying it now... I feel better"', 12, color=BLUE_DARK, italic=True)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 15 — Frontend
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Frontend — 25 Screens, React 18 + TypeScript')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(12.5), Inches(0.38),
            'Responsive: Mobile (bottom nav) → Tablet → Desktop (side nav)', 13, italic=True, color=GREY_DARK)

screens = [
    ('Student Dashboard',   'Mood card, quick check-in, recent journal entries'),
    ('Mood History',        'Recharts line chart with date range picker'),
    ('Anonymous Forum',     '"Teal Sparrow" animal names — no identity linkage'),
    ('Crisis Support',      'Severity selector with immediate help contacts'),
    ('MindBot Chat',        'Chat bubbles with typing indicator'),
    ('Admin Dashboard',     'Campus mood trends, crisis count, alert feed'),
]
sw = Inches(4.0)
sh = Inches(1.5)
for i, (name, detail) in enumerate(screens):
    col = i % 3
    row = i // 3
    x = Inches(0.25) + col * (sw + Inches(0.19))
    y = Inches(1.9) + row * (sh + Inches(0.2))
    is_admin = 'Admin' in name
    add_rect(sl, x, y, sw, sh, BLUE_DARK if is_admin else BLUE_LIGHT)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.15), sw - Inches(0.3), Inches(0.4),
                name, 14, bold=True, color=WHITE if is_admin else BLUE_DARK)
    add_textbox(sl, x + Inches(0.15), y + Inches(0.65), sw - Inches(0.3), Inches(0.7),
                detail, 12, color=WHITE if is_admin else GREY_DARK)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 16 — Security
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Security — Defence in Depth (9 Layers)')

sec_layers = [
    ('Network',     'Kubernetes NetworkPolicy — DB only accessible from API pods'),
    ('Transport',   'TLS termination at Nginx Ingress'),
    ('Auth',        'JWT (HS256, 30-min expiry) + bcrypt (cost 12)'),
    ('Authz',       'RBAC — role checked on every protected endpoint'),
    ('Rate Limit',  'slowapi — 100 requests/minute per IP'),
    ('Injection',   'SQLAlchemy ORM — parameterized queries only'),
    ('Privacy',     'Structural anonymization (no user_id in crisis/mood tables)'),
    ('Secrets',     'Kubernetes Secrets + .env (never committed to git)'),
    ('Code',        'Bandit static analysis in CI pipeline — 0 HIGH, 0 MEDIUM'),
]
row_h = Inches(0.54)
cols_x = [Inches(0.3), Inches(2.6)]
cols_w = [Inches(2.2), Inches(10.4)]

header_y = Inches(1.42)
add_rect(sl, cols_x[0], header_y, cols_w[0] - Inches(0.06), row_h, BLUE_DARK)
add_rect(sl, cols_x[1], header_y, cols_w[1] - Inches(0.06), row_h, BLUE_DARK)
add_textbox(sl, cols_x[0] + Inches(0.1), header_y + Inches(0.12), cols_w[0] - Inches(0.2), Inches(0.3),
            'Layer', 12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_textbox(sl, cols_x[1] + Inches(0.1), header_y + Inches(0.12), cols_w[1] - Inches(0.2), Inches(0.3),
            'Control', 12, bold=True, color=WHITE)

for i, (layer, ctrl) in enumerate(sec_layers):
    y = header_y + row_h + i * row_h
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    add_rect(sl, cols_x[0], y, cols_w[0] - Inches(0.06), row_h - Inches(0.02), bg)
    add_rect(sl, cols_x[1], y, cols_w[1] - Inches(0.06), row_h - Inches(0.02), bg)
    add_textbox(sl, cols_x[0] + Inches(0.1), y + Inches(0.1), cols_w[0] - Inches(0.2), Inches(0.35),
                layer, 11, bold=True, color=BLUE_DARK, align=PP_ALIGN.CENTER)
    add_textbox(sl, cols_x[1] + Inches(0.1), y + Inches(0.1), cols_w[1] - Inches(0.2), Inches(0.35),
                ctrl, 11, color=GREY_DARK)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 17 — Trade-offs
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Architectural Trade-offs')

add_textbox(sl, Inches(0.4), Inches(1.38), Inches(12.5), Inches(0.38),
            'Honest discussion of design decisions and their consequences', 13, italic=True, color=GREY_DARK)

decisions = [
    ('N-Tier over Microservices', 'Simple, testable, right for team size', 'Cannot scale individual features independently'),
    ('No server-side AI chat storage', 'GDPR minimization, privacy', 'AI has no memory between sessions'),
    ('Structural crisis anonymization', 'Identity impossible to leak', 'Cannot contact student even if they want outreach'),
    ('Minikube over cloud K8s', 'Free for students', 'Not production-grade; single-node only'),
    ('PostgreSQL over MongoDB', 'ACID compliance, strong ORM', 'Requires migrations for schema changes'),
]
headers_t = ['Decision', 'Benefit', 'Trade-off']
cws = [Inches(3.8), Inches(4.1), Inches(4.8)]
cxs = [Inches(0.3), Inches(4.1), Inches(8.2)]
rh = Inches(0.76)
hy = Inches(1.9)

for j, (hdr, cx, cw) in enumerate(zip(headers_t, cxs, cws)):
    add_rect(sl, cx, hy, cw - Inches(0.06), rh, BLUE_DARK)
    add_textbox(sl, cx + Inches(0.1), hy + Inches(0.2), cw - Inches(0.2), Inches(0.35),
                hdr, 13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

for i, (dec, ben, trd) in enumerate(decisions):
    y = hy + rh + i * rh
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    for j, (cell, cx, cw) in enumerate(zip([dec, ben, trd], cxs, cws)):
        add_rect(sl, cx, y, cw - Inches(0.06), rh - Inches(0.04), bg)
        add_textbox(sl, cx + Inches(0.1), y + Inches(0.12), cw - Inches(0.2), Inches(0.55),
                    cell, 11, color=GREY_DARK)

# Key insight
add_rect(sl, Inches(0.3), Inches(6.55), Inches(12.7), Inches(0.6), BLUE_DARK)
add_textbox(sl, Inches(0.5), Inches(6.63), Inches(12.2), Inches(0.4),
            'Key insight: Structural anonymization of crisis flags means counselors cannot proactively reach out. Deliberate privacy-safety balance.',
            12, italic=True, color=WHITE, align=PP_ALIGN.CENTER)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 18 — Results Summary
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Results Summary — All Objectives Delivered')

objectives = [
    ('Test coverage',    '≥ 80%',            '81.84% ✓'),
    ('Story points',     '93 pts',           '93 / 93 (100%) ✓'),
    ('API endpoints',    'All features',     '26 endpoints ✓'),
    ('Frontend screens', 'All features',     '25 screens ✓'),
    ('K8s manifests',    'Deployment ready', '8 YAML files ✓'),
    ('Jenkins stages',   'Full CI/CD',       '9 stages ✓'),
    ('Ansible playbooks','VPS automation',   '2 playbooks ✓'),
    ('Grafana panels',   'Observability',    '6 panels ✓'),
    ('UML diagrams',     'Architecture doc', '7 diagrams ✓'),
]
cws_r = [Inches(4.5), Inches(3.5), Inches(4.5)]
cxs_r = [Inches(0.3), Inches(4.8), Inches(8.3)]
hdrs_r = ['Objective', 'Target', 'Achieved']
rh = Inches(0.6)
hy = Inches(1.42)

for j, (hdr, cx, cw) in enumerate(zip(hdrs_r, cxs_r, cws_r)):
    add_rect(sl, cx, hy, cw - Inches(0.06), rh, BLUE_DARK)
    add_textbox(sl, cx + Inches(0.1), hy + Inches(0.13), cw - Inches(0.2), Inches(0.35),
                hdr, 13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

for i, (obj, tgt, ach) in enumerate(objectives):
    y = hy + rh + i * rh
    bg = GREY_LIGHT if i % 2 == 0 else WHITE
    for j, (cell, cx, cw) in enumerate(zip([obj, tgt, ach], cxs_r, cws_r)):
        add_rect(sl, cx, y, cw - Inches(0.06), rh - Inches(0.02), bg)
        is_ach = j == 2
        add_textbox(sl, cx + Inches(0.1), y + Inches(0.1), cw - Inches(0.2), Inches(0.42),
                    cell, 12, bold=is_ach, color=ACCENT if is_ach else GREY_DARK,
                    align=PP_ALIGN.CENTER if j == 1 else PP_ALIGN.LEFT)

# Bottom
add_rect(sl, Inches(0.3), Inches(7.1), Inches(12.7), Inches(0.25), ACCENT)
add_textbox(sl, Inches(0.4), Inches(7.12), Inches(12.5), Inches(0.2),
            'Exam sections: 10/10 covered | Total marks available: 105',
            11, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 19 — Recommendations
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, WHITE)
add_title_bar(sl, 'Recommendations — What We Would Do With More Time')

future = [
    ('WebSockets',             'Real-time crisis alerts without page refresh'),
    ('React Native',           'Native mobile app sharing the same API'),
    ('PWA + Offline mode',     'Journal works without internet (Service Workers)'),
    ('Clinical screening',     'PHQ-9 / GAD-7 integration with auto-escalation'),
    ('Client-side encryption', 'Web Crypto API — DB breach reveals nothing'),
]

add_textbox(sl, Inches(0.4), Inches(1.42), Inches(5.5), Inches(0.38),
            'Technical Enhancements', 14, bold=True, color=BLUE_DARK)

for i, (title, detail) in enumerate(future):
    y = Inches(1.88) + i * Inches(0.88)
    add_rect(sl, Inches(0.3), y, Inches(0.38), Inches(0.38), BLUE_DARK)
    add_textbox(sl, Inches(0.32), y, Inches(0.34), Inches(0.38),
                str(i+1), 14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_textbox(sl, Inches(0.8), y, Inches(5.2), Inches(0.38),
                title, 14, bold=True, color=BLUE_DARK)
    add_textbox(sl, Inches(0.8), y + Inches(0.38), Inches(5.2), Inches(0.38),
                detail, 12, color=GREY_DARK)

# Process improvements column
add_textbox(sl, Inches(6.8), Inches(1.42), Inches(6.2), Inches(0.38),
            'Process Improvements', 14, bold=True, color=BLUE_DARK)

process = [
    'Spike infrastructure stories before committing to sprint',
    'Playwright E2E tests for critical UI flows',
    'Story point reference card for infrastructure tasks',
    'Pair programming for complex DevOps tasks',
]
for i, p in enumerate(process):
    y = Inches(1.88) + i * Inches(0.8)
    add_rect(sl, Inches(6.8), y + Inches(0.07), Inches(0.18), Inches(0.18), ACCENT)
    add_textbox(sl, Inches(7.1), y, Inches(5.8), Inches(0.65), p, 13, color=GREY_DARK)

add_footer(sl)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 20 — Conclusion
# ─────────────────────────────────────────────────────────────────────────────
sl = blank_slide()
add_rect(sl, 0, 0, W, H, BLUE_DARK)
add_rect(sl, 0, H - Inches(0.5), W, Inches(0.5), BLUE_MID)
add_rect(sl, 0, H - Inches(0.15), W, Inches(0.15), ACCENT)

add_textbox(sl, Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.6),
            'Conclusion', 28, bold=True, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

add_textbox(sl, Inches(0.8), Inches(1.1), Inches(11.7), Inches(0.55),
            'MindBridge bridges the gap between student distress and campus support.',
            20, italic=True, color=WHITE, align=PP_ALIGN.CENTER)

pillars = [
    ('01', 'Privacy by Design',
     'Not policy, not configuration. The database schema structurally prevents identity leakage.\nA compromised admin account still cannot identify a student.'),
    ('02', 'Full-Stack Delivery',
     'Working code, tests, CI/CD, Kubernetes. Not just architecture diagrams —\na real, deployable system.'),
    ('03', 'Real Problem, Real Solution',
     '34% of African university students meet mental health criteria.\nMindBridge gives them a safe, anonymous, always-on support channel.'),
]
for i, (num, title, body) in enumerate(pillars):
    x = Inches(0.3) + i * Inches(4.35)
    add_rect(sl, x, Inches(1.85), Inches(4.1), Inches(3.2), BLUE_MID)
    add_textbox(sl, x + Inches(0.15), Inches(1.95), Inches(3.8), Inches(0.55),
                num, 28, bold=True, color=ACCENT, align=PP_ALIGN.CENTER)
    add_textbox(sl, x + Inches(0.15), Inches(2.5), Inches(3.8), Inches(0.45),
                title, 14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_textbox(sl, x + Inches(0.15), Inches(3.0), Inches(3.8), Inches(0.95),
                body, 11, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# Quote
add_rect(sl, Inches(0.5), Inches(5.25), Inches(12.3), Inches(0.08), ACCENT)
add_textbox(sl, Inches(0.5), Inches(5.38), Inches(12.3), Inches(0.6),
            '"The most important lesson: privacy, like security, is a design property — not a configuration option."',
            16, italic=True, color=WHITE, align=PP_ALIGN.CENTER)

add_textbox(sl, Inches(0.5), Inches(6.1), Inches(12.3), Inches(0.55),
            'Thank you. Questions welcome.', 24, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

add_textbox(sl, Inches(0.5), Inches(6.65), Inches(12.3), Inches(0.4),
            'Appendix available on request: ERD detail | Full burndown tables | Bandit output | Coverage HTML report',
            11, italic=True, color=BLUE_LIGHT, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────────────────────────────────────
prs.save(OUTPUT)
print(f'SUCCESS: {OUTPUT}')
print(f'Slides: {len(prs.slides)}')
import os
print(f'Size: {round(os.path.getsize(OUTPUT)/1024)} KB')
