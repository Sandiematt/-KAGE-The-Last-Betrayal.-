extends SceneTree
## Rasterises SVG files with Godot's own SVG loader (ThorVG), so the cut matches what Godot would draw.
## Used by tools/akari-rig/cut.py:
##   godot --headless --path godot/akari-rig --script res://build/raster.gd -- --scale=1 a.svg=a.png b.svg=b.png

func _init() -> void:
	var scale := 1.0
	var jobs: Array[PackedStringArray] = []
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--scale="):
			scale = float(arg.trim_prefix("--scale="))
		elif "=" in arg:
			jobs.append(arg.split("=", true, 1))
	var failed := false
	for job in jobs:
		var img := Image.new()
		var err := img.load_svg_from_buffer(FileAccess.get_file_as_bytes(job[0]), scale)
		if err != OK:
			push_error("svg load failed (%d): %s" % [err, job[0]])
			failed = true
			continue
		img.save_png(job[1])
		print("raster ", job[1], " ", img.get_size())
	quit(1 if failed else 0)
