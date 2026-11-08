"""The spiraling petal column shared by Petal Storm (VFX_Sakura_Spiral, with its floor tell) and Petal Tornado
(VFX_Sakura_Tornado, looping, no tell, carried across the floor by the director)."""
from _sakura import *


def storm_layers(delay, storm, radius=.85, height=2.3, pivot_life=120, spin=7):
    """Petals rising on a circle under a yawing pivot (children follow it every frame, so each petal traces a helix),
    torn strands wrapping it at random heights, and a scrolling wind column that flares toward the top."""
    return [
        dict(name='Spiral pivot', renderer='None', life=pivot_life, delay=delay, spin=[0, spin, 0], children=[
            petals('Spiral stream', 60, interval=1.2, life=(38, 42), size=(.14, .22), gravity=0, turbulence=.002,
                   spawn=dict(shape='Circle', radius=[radius * .88, radius * 1.12], rotate=True), velocity=[0, [.04, .05], 0]),
            wisps('Spiral strands', PINK, radius * 1.18, count=8, interval=9, width=.26, life=(18, 26), size=(.8, 1.2),
                  tilt=((-82, -62), (0, 360), (-10, 10)), position=[0, [.3, height * .83], 0]),
        ]),
        column('Wind column', fade(PINK, 110), radius * 1.06, height, storm, delay=delay, scroll=(.025, -.035), fade_in=4,
               fade_out=22, radius2=radius * 1.35, emissive=1.4),
    ]
