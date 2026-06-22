Drop your sprite files here with these exact names:

  forest_idle.png
      Single frame — the front-facing idle pose (two eyes).
      Can be any resolution; the game auto-detects frame size.

  forest_walking_and_jumping.png
      7-frame sheet: 4 walk frames on the TOP row, 3 jump frames on the BOTTOM row.
      All frames must be equal width. The sheet is read as cols=4, rows=2.

Once files are in place, reload index.html — sprites load automatically.
The canvas-drawn fallback stays active for any missing sheet.
