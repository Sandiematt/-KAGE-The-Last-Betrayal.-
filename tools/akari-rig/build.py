"""Rebuild Akari's Godot rig from the art in one go:

    python tools/akari-rig/build.py             # cut -> import -> build scenes/akari.tscn
    python tools/akari-rig/build.py --record    # ...then record the autopilot demo to .scratch/akari-rig/

1. tools/akari-rig/cut.py cuts the SVG into part textures, meshes and weights (godot/akari-rig/art/).
2. Godot imports the new textures.
3. godot/akari-rig/build/build_akari.gd assembles scenes/akari.tscn (Skeleton2D, Bone2D chains, skinned
   Polygon2Ds, spinning flowers, petals, SecondaryMotionChain nodes).
With --record, Godot's movie maker renders the demo on autopilot (a window opens: headless can't render)
and ffmpeg turns it into akari_demo.mp4 and akari_demo.gif; --mesh records with the mesh and bone overlay.
"""
import glob
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
PROJ = os.path.join(ROOT, "godot", "akari-rig")
OUT = os.path.join(ROOT, ".scratch", "akari-rig")
sys.path.insert(0, HERE)
from cut import godot_bin, main as cut  # noqa: E402


def run(args, **kw):
    print("$", " ".join(os.path.basename(a) if i == 0 else a for i, a in enumerate(args)))
    subprocess.run(args, check=True, **kw)


def record(mesh=False, seconds=14):
    frames = os.path.join(OUT, "movie_mesh" if mesh else "movie")
    shutil.rmtree(frames, ignore_errors=True)
    os.makedirs(frames)
    user = ["--auto"] + (["--mesh"] if mesh else [])
    run([godot_bin(), "--path", PROJ, "--resolution", "1280x720", "--write-movie",
         os.path.join(frames, "f.png"), "--fixed-fps", "30", "--quit-after", str(seconds * 30), "--"] + user,
        stdout=subprocess.DEVNULL)
    name = "akari_demo_mesh" if mesh else "akari_demo"
    ff = shutil.which("ffmpeg")
    if not ff:
        print("ffmpeg not found: frames are in", frames)
        return
    src = os.path.join(frames, "f%08d.png")
    run([ff, "-y", "-loglevel", "error", "-framerate", "30", "-i", src, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-crf", "20", os.path.join(OUT, name + ".mp4")])
    run([ff, "-y", "-loglevel", "error", "-framerate", "30", "-i", src, "-vf",
         "fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=160[p];[b][p]paletteuse=dither=bayer",
         os.path.join(OUT, name + ".gif")])
    print("wrote", os.path.join(OUT, name + ".mp4"), "and .gif")


if __name__ == "__main__":
    cut()
    g = godot_bin()
    run([g, "--headless", "--path", PROJ, "--import"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    run([g, "--headless", "--path", PROJ, "--script", "res://build/build_akari.gd"])
    if "--record" in sys.argv:
        record(mesh="--mesh" in sys.argv)
