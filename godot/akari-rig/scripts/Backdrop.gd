extends Node2D
## The courtyard behind Akari, in the art's palette: crimson sky, a pale moon behind cloud bands, pagoda and
## torii silhouettes in two parallax depths, and a tiled stone floor whose grid shows how fast she moves.
## Drawn on a background CanvasLayer; `scroll` is the camera's x.

var scroll := 0.0:
	set(v):
		scroll = v
		queue_redraw()
## Screen y of the arena floor (set by the demo from its camera).
var floor_y := 700.0

const SKY_TOP := Color("4a070b")
const SKY_LOW := Color("8a1a1c")
const MOON := Color("c46a6c")
const BAND := Color("5a0a0e")
const FAR := Color("5c0c10")
const NEAR := Color("420609")
const FLOOR := Color("3a0507")
const GRID := Color("5a1014")


func _draw() -> void:
	var size := get_viewport_rect().size
	var horizon := floor_y - size.y * 0.16
	# sky
	var steps := 24
	for i in steps:
		var a := float(i) / steps
		draw_rect(Rect2(0, horizon * a, size.x, horizon / steps + 1), SKY_TOP.lerp(SKY_LOW, a))
	draw_rect(Rect2(0, horizon, size.x, size.y - horizon), SKY_LOW)
	# moon with a dim inner disc, then cloud bands across it
	var moon_c := Vector2(size.x * 0.66 - fposmod(scroll * 0.03, size.x * 0.4) + size.x * 0.2, size.y * 0.26)
	draw_circle(moon_c, size.y * 0.2, MOON)
	draw_circle(moon_c + Vector2(-size.y * 0.05, -size.y * 0.03), size.y * 0.035, MOON.darkened(0.12))
	for b in [[0.24, 0.55, 0.012], [0.33, 0.8, 0.016], [0.41, 0.6, 0.012]]:
		var y: float = size.y * b[0]
		var w: float = size.x * b[1]
		var x := fposmod(-scroll * 0.05 + b[1] * 900.0, size.x + w) - w * 0.5
		draw_rect(Rect2(x, y, w, size.y * b[2]), BAND)
	# far pagodas
	_layer(size, horizon, 0.18, 760.0, FAR, true)
	# near torii posts
	_layer(size, horizon, 0.45, 980.0, NEAR, false)
	# floor
	draw_rect(Rect2(0, floor_y, size.x, size.y - floor_y), FLOOR)
	draw_line(Vector2(0, floor_y), Vector2(size.x, floor_y), GRID.lightened(0.15), 2.0)
	for k in range(-2, 40):
		var x := fposmod(-scroll * 0.95, 140.0) + k * 140.0
		draw_line(Vector2(x, floor_y), Vector2(x + (x - size.x * 0.5) * 0.9, size.y), GRID, 1.5)
	for r in [0.05, 0.12, 0.22]:
		var y: float = floor_y + (size.y - floor_y) * float(r) * 4.0
		draw_line(Vector2(0, y), Vector2(size.x, y), GRID, 1.0)


func _layer(size: Vector2, horizon: float, factor: float, spacing: float, col: Color, pagoda: bool) -> void:
	var off := fposmod(-scroll * factor, spacing)
	for k in range(-1, int(size.x / spacing) + 2):
		var x := off + k * spacing
		if pagoda:
			var base := horizon + 20.0
			for tier in 3:
				var w := 150.0 - tier * 34.0
				var y := base - tier * 62.0
				draw_colored_polygon(PackedVector2Array([Vector2(x - w, y), Vector2(x + w, y),
						Vector2(x + w * 0.62, y - 26.0), Vector2(x - w * 0.62, y - 26.0)]), col)
				draw_rect(Rect2(x - w * 0.5, y, w, 40.0), col)
			draw_rect(Rect2(x - 4, base - 3 * 62.0 - 46.0, 8, 30), col)
		else:
			var top := horizon - 150.0
			draw_rect(Rect2(x - 70, top, 16, size.y), col)
			draw_rect(Rect2(x + 54, top, 16, size.y), col)
			draw_rect(Rect2(x - 100, top - 10, 200, 18), col)
			draw_rect(Rect2(x - 84, top + 30, 168, 10), col)
