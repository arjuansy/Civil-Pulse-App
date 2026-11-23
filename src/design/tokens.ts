/**
 * Civic Pulse — Design Tokens
 * Single source of truth for all visual constants.
 * Consumed by all screens and components.
 */

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────

export const Colors = {
  // Primary brand
  primary: "#176B52",
  primaryDark: "#124C3D",
  primaryLight: "#1E8A6A",

  // Secondary / surface tints
  sageSoft: "#DCEBE2",
  mintLight: "#EEF5F0",

  // Backgrounds
  bgMain: "#F7F9F7",
  bgSurface: "#FFFFFF",
  bgSubtle: "#F0F3F0",

  // Borders
  borderDefault: "#E2E8E4",
  borderSubtle: "#EDF0EF",

  // Typography
  textPrimary: "#202B26",
  textSecondary: "#68766E",
  textMuted: "#929D96",
  textInverse: "#FFFFFF",

  // Semantic — use ONLY for status communication
  critical: "#D94343",
  criticalSurface: "#FEF2F2",
  criticalBorder: "#FECACA",

  warning: "#E99A35",
  warningSurface: "#FFFBEB",
  warningBorder: "#FDE68A",

  info: "#3D7FC2",
  infoSurface: "#EFF6FF",
  infoBorder: "#BFDBFE",

  success: "#31966B",
  successSurface: "#ECFDF5",
  successBorder: "#A7F3D0",

  // Category — report types
  catJalan: "#D94343",    // critical (road = high urgency)
  catBanjir: "#3D7FC2",   // info (flood = informational)
  catFasilitas: "#E99A35", // warning (facility = moderate)

  // Map / UI chrome
  mapOverlay: "rgba(255,255,255,0.95)",
  scrim: "rgba(32,43,38,0.4)",
} as const;

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────

export const Typography = {
  // Screen headings (H1)
  h1: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.5, color: Colors.textPrimary },
  // Section headings (H2)
  h2: { fontSize: 18, fontWeight: "700" as const, color: Colors.textPrimary },
  // Card titles / subsection headings (H3)
  h3: { fontSize: 15, fontWeight: "700" as const, color: Colors.textPrimary },
  // Body — primary
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20, color: Colors.textPrimary },
  // Body — medium weight
  bodyMedium: { fontSize: 14, fontWeight: "600" as const, color: Colors.textPrimary },
  // Caption / supporting
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 17, color: Colors.textSecondary },
  captionMedium: { fontSize: 12, fontWeight: "600" as const, color: Colors.textSecondary },
  // Label / badge text
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.5, color: Colors.textMuted },
  // Micro — metadata timestamps etc.
  micro: { fontSize: 11, fontWeight: "400" as const, color: Colors.textMuted },
} as const;

// ─── SPACING ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// ─── RADIUS ──────────────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
} as const;

// ─── SHADOWS ─────────────────────────────────────────────────────────────────

export const Shadow = {
  // For floating controls overlaid on the map
  float: {
    shadowColor: "#174037",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  // For surface cards
  card: {
    shadowColor: "#174037",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

// ─── SIZING ──────────────────────────────────────────────────────────────────

export const Size = {
  // Minimum touch target (accessibility)
  touchTarget: 48,
  // Icon sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  // Header bar
  headerHeight: 60,
  // Tab bar
  tabHeight: 52,
  // Input field
  inputHeight: 48,
  // Button
  buttonHeight: 48,
  buttonHeightSm: 40,
} as const;
