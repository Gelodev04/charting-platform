export type DrawingMenuItem = {
  id: string;
  label: string;
  iconKey:
    | "ArrowUpRight"
    | "Crosshair"
    | "GitBranch"
    | "MoveRight"
    | "Paintbrush"
    | "Ruler"
    | "Waves";
  shortcut?: string;
  active?: boolean;
};

export type DrawingMenuSection = {
  title: string;
  items: DrawingMenuItem[];
};

export const LINES_MENU: DrawingMenuSection[] = [
  {
    title: "LINES",
    items: [
      { id: "trendline", label: "Trendline", iconKey: "MoveRight", shortcut: "Alt + T", active: true },
      { id: "ray", label: "Ray", iconKey: "ArrowUpRight" },
      { id: "info_line", label: "Info line", iconKey: "MoveRight" },
      { id: "extended_line", label: "Extended line", iconKey: "MoveRight" },
      { id: "trend_angle", label: "Trend angle", iconKey: "ArrowUpRight" },
      { id: "horizontal_line", label: "Horizontal line", iconKey: "MoveRight", shortcut: "Alt + H" },
      { id: "horizontal_ray", label: "Horizontal ray", iconKey: "MoveRight", shortcut: "Alt + J" },
      { id: "vertical_line", label: "Vertical line", iconKey: "MoveRight", shortcut: "Alt + V" },
      { id: "cross_line", label: "Cross line", iconKey: "Crosshair", shortcut: "Alt + C" },
    ],
  },
  {
    title: "CHANNELS",
    items: [
      { id: "parallel_channel", label: "Parallel channel", iconKey: "GitBranch" },
      { id: "regression_trend", label: "Regression trend", iconKey: "GitBranch" },
      { id: "flat_top_bottom", label: "Flat top/bottom", iconKey: "GitBranch" },
      { id: "disjoint_channel", label: "Disjoint channel", iconKey: "GitBranch", active: true },
    ],
  },
  {
    title: "PITCHFORKS",
    items: [
      { id: "pitchfork", label: "Pitchfork", iconKey: "Waves" },
      { id: "schiff_pitchfork", label: "Schiff pitchfork", iconKey: "Waves" },
      { id: "modified_schiff_pitchfork", label: "Modified Schiff pitchfork", iconKey: "Waves" },
      { id: "inside_pitchfork", label: "Inside pitchfork", iconKey: "Waves" },
    ],
  },
];

export const FIBONACCI_MENU: DrawingMenuSection[] = [
  {
    title: "FIBONACCI",
    items: [
      { id: "fib_retracement", label: "Fib retracement", iconKey: "MoveRight", shortcut: "Alt + F", active: true },
      { id: "trend_based_fib_extension", label: "Trend-based fib extension", iconKey: "ArrowUpRight" },
      { id: "fib_channel", label: "Fib channel", iconKey: "GitBranch" },
      { id: "fib_time_zone", label: "Fib time zone", iconKey: "Waves" },
      { id: "fib_speed_resistance_fan", label: "Fib speed resistance fan", iconKey: "Waves" },
      { id: "trend_based_fib_time", label: "Trend-based fib time", iconKey: "Waves" },
      { id: "fib_circles", label: "Fib circles", iconKey: "Waves" },
      { id: "fib_spiral", label: "Fib spiral", iconKey: "Waves" },
      { id: "fib_speed_resistance_arcs", label: "Fib speed resistance arcs", iconKey: "Waves" },
      { id: "fib_wedge", label: "Fib wedge", iconKey: "Waves" },
      { id: "pitchfan", label: "Pitchfan", iconKey: "Waves" },
    ],
  },
  {
    title: "GANN",
    items: [
      { id: "gann_box", label: "Gann box", iconKey: "GitBranch" },
      { id: "gann_square_fixed", label: "Gann square fixed", iconKey: "GitBranch" },
      { id: "gann_square", label: "Gann square", iconKey: "GitBranch" },
      { id: "gann_fan", label: "Gann fan", iconKey: "Waves" },
    ],
  },
];

export const PATTERNS_MENU: DrawingMenuSection[] = [
  {
    title: "CHART PATTERNS",
    items: [
      { id: "xabcd_pattern", label: "XABCD pattern", iconKey: "GitBranch", active: true },
      { id: "cypher_pattern", label: "Cypher pattern", iconKey: "GitBranch" },
      { id: "head_shoulders", label: "Head and shoulders", iconKey: "GitBranch" },
      { id: "abcd_pattern", label: "ABCD pattern", iconKey: "GitBranch" },
      { id: "triangle_pattern", label: "Triangle pattern", iconKey: "GitBranch" },
      { id: "three_drives_pattern", label: "Three drives pattern", iconKey: "GitBranch" },
    ],
  },
  {
    title: "ELLIOTT WAVES",
    items: [
      { id: "elliott_impulse_wave", label: "Elliott impulse wave (1-2-3-4-5)", iconKey: "Waves" },
      { id: "elliott_correction_wave", label: "Elliott correction wave (A-B-C)", iconKey: "Waves" },
      { id: "elliott_triangle_wave", label: "Elliott triangle wave (A-B-C-D-E)", iconKey: "Waves" },
      { id: "elliott_double_combo_wave", label: "Elliott double combo wave (W-X-Y)", iconKey: "Waves" },
      { id: "elliott_triple_combo_wave", label: "Elliott triple combo wave (W-X-Y-X-Z)", iconKey: "Waves" },
    ],
  },
  {
    title: "CYCLES",
    items: [
      { id: "cyclic_lines", label: "Cyclic lines", iconKey: "MoveRight" },
      { id: "time_cycles", label: "Time cycles", iconKey: "Waves" },
      { id: "sine_line", label: "Sine line", iconKey: "Waves" },
    ],
  },
];

export const FORECAST_MENU: DrawingMenuSection[] = [
  {
    title: "FORECASTING",
    items: [
      { id: "long_position", label: "Long position", iconKey: "MoveRight", active: true },
      { id: "short_position", label: "Short position", iconKey: "MoveRight" },
      { id: "position_forecast", label: "Position forecast", iconKey: "Waves" },
      { id: "bar_pattern", label: "Bar pattern", iconKey: "Waves" },
      { id: "ghost_feed", label: "Ghost feed", iconKey: "Waves" },
      { id: "sector", label: "Sector", iconKey: "GitBranch" },
    ],
  },
  {
    title: "VOLUME-BASED",
    items: [
      { id: "anchored_vwap", label: "Anchored VWAP", iconKey: "Waves" },
      { id: "fixed_range_volume_profile", label: "Fixed range volume profile", iconKey: "GitBranch" },
      { id: "anchored_volume_profile", label: "Anchored volume profile", iconKey: "GitBranch" },
    ],
  },
  {
    title: "MEASURERS",
    items: [
      { id: "price_range", label: "Price range", iconKey: "Ruler" },
      { id: "date_range", label: "Date range", iconKey: "Ruler" },
      { id: "date_price_range", label: "Date and price range", iconKey: "Ruler" },
    ],
  },
];

export const BRUSHES_MENU: DrawingMenuSection[] = [
  {
    title: "BRUSHES",
    items: [
      { id: "brush", label: "Brush", iconKey: "Paintbrush", active: true },
      { id: "highlighter", label: "Highlighter", iconKey: "Paintbrush" },
    ],
  },
  {
    title: "ARROWS",
    items: [
      { id: "arrow_marker", label: "Arrow marker", iconKey: "ArrowUpRight" },
      { id: "arrow", label: "Arrow", iconKey: "ArrowUpRight" },
      { id: "arrow_mark_up", label: "Arrow mark up", iconKey: "ArrowUpRight" },
      { id: "arrow_mark_down", label: "Arrow mark down", iconKey: "ArrowUpRight" },
    ],
  },
  {
    title: "SHAPES",
    items: [
      { id: "rectangle", label: "Rectangle", iconKey: "GitBranch", shortcut: "Alt + Shift + R" },
      { id: "rotated_rectangle", label: "Rotated rectangle", iconKey: "GitBranch" },
      { id: "path", label: "Path", iconKey: "MoveRight" },
      { id: "circle", label: "Circle", iconKey: "Waves" },
      { id: "ellipse", label: "Ellipse", iconKey: "Waves" },
      { id: "polyline", label: "Polyline", iconKey: "GitBranch" },
      { id: "triangle", label: "Triangle", iconKey: "GitBranch" },
      { id: "arc", label: "Arc", iconKey: "Waves" },
      { id: "curve", label: "Curve", iconKey: "Waves" },
      { id: "double_curve", label: "Double curve", iconKey: "Waves" },
    ],
  },
];

export const TEXT_NOTES_MENU: DrawingMenuSection[] = [
  {
    title: "TEXT AND NOTES",
    items: [
      { id: "text", label: "Text", iconKey: "Ruler", active: true },
      { id: "anchored_text", label: "Anchored text", iconKey: "Ruler" },
      { id: "note", label: "Note", iconKey: "GitBranch" },
      { id: "price_note", label: "Price note", iconKey: "GitBranch" },
      { id: "pin", label: "Pin", iconKey: "Waves" },
      { id: "table", label: "Table", iconKey: "GitBranch" },
      { id: "callout", label: "Callout", iconKey: "MoveRight" },
      { id: "comment", label: "Comment", iconKey: "Waves" },
      { id: "price_label", label: "Price label", iconKey: "MoveRight" },
      { id: "signpost", label: "Signpost", iconKey: "Waves" },
      { id: "flag_mark", label: "Flag mark", iconKey: "MoveRight" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { id: "image", label: "Image", iconKey: "GitBranch" },
      { id: "post", label: "Post", iconKey: "MoveRight" },
      { id: "idea", label: "Idea", iconKey: "Waves" },
    ],
  },
];
