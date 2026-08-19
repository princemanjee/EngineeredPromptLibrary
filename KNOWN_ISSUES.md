# Known Issues: PromptLibrary 4.0

Tracks content-level defects found during Stage 3 review, separate from the
mechanical/structural checks in `DRIFT_SWEEP.md`. Applies to both the XML and
Markdown copy of each file: Markdown is rendered from XML in this pipeline
(Stage 1 authors XML, Stage 3 fixes XML via the Edit tool, Stage 4 renders
Markdown from the fixed XML), not authored independently, so whatever is true
of one format is true of the other. Spot-checked directly for
`chess_player` and `biblical_translator`; both formats carried identical state.

## Open

None. All previously tracked defects are resolved.

## Resolved by re-authoring

### `biblical_translator` (resolved 2026-08-19)

Was self-documented as `UNRESOLVED INTENT DRIFT`. The 1.0 source prompt is a
style-transfer task: plain modern English in, the same meaning back in an
elevated biblical register, no explanation attached. The 2.0 upgrade
reinterpreted this as literal ancient-language scripture translation
(Hebrew/Greek/Aramaic source text to modern English), and 3.0 and the first
4.0 authoring carried that reinterpretation forward, to the point that the
file's Boundaries section declined the task its own source prompt asks for.

**Resolution:** full Stage 1 re-authoring of the 4.0 XML against the
style-transfer task, restoring the 1.0 XML's Chain-of-Verification strategy
(independent questions catch archaic-grammar errors and meaning drift that
self-review misses) combined with a Self-Refine critique cycle. The Markdown
was re-rendered from the new XML, and the skills plugin
(`EPL-ClaudeSkillsPlugin`, monolith plus the `pl-teaching-languages` split)
was regenerated to match. The Source Intent test in the file's PROMPT_TESTING
section is now a pass/fail regression guard ("Hello, World!" must return only
a biblical-register rendering), and scripture translation is explicitly out
of scope. The drift history is preserved in the file's ORIGINAL_PROMPT note
and in `PromptLibrary-4.0/DRIFT_SWEEP.md`.

## Resolved during Stage 3

Everything below was a real defect at an earlier point in this project's
Stage 3 review pass. Each has since been corrected, and, as a deliberate
pattern in this library, the correction is documented inline in the file
itself, comparing the fixed version against the earlier flawed one it
replaced. Listed here (not omitted) because each file's own adversarial
testing / regression-check section now tests for a return to the old
behavior; this is the reference for what that guards against.

- **`chess_player`**: flagship worked example previously had incorrect
  turn parity and misidentified a non-pin as a pin. Now states "White to
  move" correctly and explicitly names the blocking pawn that makes the
  position not a pin.
- **`r_programming_interpreter`**: flagship `sample()` example previously
  fabricated five specific integers as if they were real RNG output. Now
  refuses to invent a draw, emits only the derivable structure, and explains
  why a "plausible" fabricated value is worse than an error.
- **`statistician`**: Fermi-estimate sanity check previously passed while
  contradicting its own cited benchmark; a Welch's t-test example had wrong
  df, CI, and power. Now recomputes every figure and documents the three
  numeric errors the earlier draft contained (df = 12.8 vs. the correct 13.17,
  among others).
- **`virtual_doctor`**: dosing example previously exceeded its own stated
  safety ceiling and fabricated a clinical detail contradicting the stated
  input. Now states no specific numeric doses at all, and names unstated
  assumptions explicitly instead of silently filling them in.
- **`restaurant_owner`**: flagship recipe previously marinated raw pork
  unrefrigerated and applied the poultry cook temperature (165°F) to a pork
  cut. Now uses correct floors (145°F pork + rest, 165°F poultry) and
  refrigerated marination; its own adversarial-testing section tests for
  regression on exactly this.
- **`salesperson`**: PRINCIPLES section previously modeled a fabricated
  "three Fortune 100 CTOs" endorsement as an example of good persuasion. Now
  explicitly bans attributing invented claims to real, identifiable entities
  and uses a fictional reference class instead.
- **`socratic_method`**: previously scripted the false line "I confess I do
  not know" as a standard deflection. Now explicitly prohibits that exact
  line and explains why it is dishonest.
- **`idea_clarifier_gpt`**: quality rubric previously rewarded a fabricated,
  unverifiable statistic (a "Peerby data showed a 34% lift" claim) as a
  top-scoring example. Now scores the top anchor on an example with zero
  unsourced statistics, and documents the old fabricated version as the
  labeled failure case.
- **`tech_writer`**: same rubric-rewards-fabrication pattern: an earlier
  draft invented OS version numbers and download sizes wholesale for a
  product that doesn't exist. Now uses placeholders instead of invented
  figures.
- **`linkedin_ghostwriter`**: quality dimension previously miscounted words
  in its own worked examples while claiming an exact-count discipline. Now
  recounts on final text after the last revision and documents the earlier
  miscounts (13 vs. actual 12 words, etc.).
- **`linux_script_developer`**: safety-guard example previously had a
  path-traversal bypass (validated the path string before resolving
  `realpath`), a `readonly EXECUTE=false` flag that permanently disabled its
  own kill-switch, and a `trap ERR` that could never fire. Now resolves paths
  before comparison and the gate variable is mutable.
- **`virtual_fitness_coach`, `remote_worker_fitness_trainer`,
  `personal_trainer`, `yogi`**: flagged for relying on a footer disclaimer
  instead of real pre-participation health screening. All four now contain
  explicit contraindication and screening logic (`yogi` alone: a named
  Pre-Practice Screen plus dozens of contraindication references covering
  hypertension, pregnancy, glaucoma, epilepsy, and panic disorder).

## Note on this file's accuracy

An earlier draft of this same tracking effort (in conversation, before this
file existed) listed the "Resolved" items above as still-open defects. That
was stale: it repeated Stage 3's *findings* without re-checking them against
current file content, and Stage 3 had already fixed all of them in the same
pass that found them. This file reflects direct verification against current
`PromptLibrary-4.0/Markdown/*.md` content, not memory of the review process.
