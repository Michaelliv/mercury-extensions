---
name: charts
description: Generate SVG/PNG charts (bar, line, pie, scatter, radar, heatmap, funnel, gauge, sankey, etc.) from ECharts JSON configs
---

# Charts CLI

Generate charts from the command line using ECharts. No browser needed.

## Usage

### List available chart types

```bash
charts schema --list
```

### Get schema for a chart type

```bash
charts schema bar
charts schema pie
charts schema xAxis
```

### Render a chart

```bash
# Pipe JSON config
cat option.json | charts render -o outbox/chart.png

# Or render from file
charts render --config option.json -o outbox/chart.png
```

### Options

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output path (`.svg` or `.png`) |
| `-W, --width <n>` | Width in pixels (default: 800) |
| `-H, --height <n>` | Height in pixels (default: 400) |
| `--theme <name>` | `dark`, `vintage`, or path to JSON |
| `--format <type>` | `svg` or `png` (auto-detected from extension) |

### Supported chart types

bar, line, pie, scatter, radar, funnel, gauge, treemap, boxplot, heatmap, candlestick, sankey

## Visual style rules

Always apply these defaults unless the user asks for something else.

### Global defaults

- `backgroundColor: "#ffffff"`
- Title: centered, top 14, fontSize 16, fontWeight bold, color `#111827`
- Grid: `{ left: 60, right: 32, top: 60, bottom: 48 }`
- Color palette: `#4f46e5`, `#0d9488`, `#d97706`, `#dc2626`, `#7c3aed`, `#0891b2`

### Axis styling

- xAxis: hide ticks, axis line `#d1d5db`, label color `#4b5563`, fontSize 13
- yAxis: hide line + ticks, label color `#9ca3af`, dashed split lines `#e5e7eb`

### Bar

- `barWidth: "50%"`
- Rounded top corners: `borderRadius: [5,5,0,0]`
- Labels on top

### Line

- `smooth: true`
- `symbol: "circle"`, `symbolSize: 7`, line width 3
- Single-series line charts should usually use light area fill

### Pie / donut

- No axes
- Use white segment borders
- Prefer `-W 800 -H 500`

### Scatter

- Both axes `type: "value"`
- `symbolSize: 8`, opacity `0.7`

### Radar / Funnel / Gauge / Heatmap / Sankey / Treemap / Boxplot / Candlestick

Use the same conventions as documented by `charts schema` and keep styling clean and modern.

## Workflow

1. Use `charts schema <type>` to inspect the config shape
2. Build the ECharts JSON option
3. Render to a file in `outbox/`
4. Reply briefly describing the chart so Mercury sends the file back to the user
