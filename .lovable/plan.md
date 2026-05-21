## Goal
Reduce the top padding above the "A3 MARKETING TEAM SERVICE REQUEST" content inside the blue hero header by 20px.

## Context
The outer page wrapper (`src/routes/index.tsx`) is already at `pt-[10px]` — reducing it further isn't meaningful. The visible top space inside the blue header itself comes from the hero card's `p-8` (32px on all sides) in `src/components/intake/IntakeForm.tsx` (line 141).

## Change
In `src/components/intake/IntakeForm.tsx` line 141, split the uniform `p-8` into directional padding so only the top shrinks by 20px:
- From: `p-8`
- To: `px-8 pb-8 pt-3` (32px → 12px top, other sides unchanged)

No other files affected.