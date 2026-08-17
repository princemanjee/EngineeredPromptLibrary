# Intent Drift Sweep: 1.0 originals vs 3.0

**Run:** 2026-08-16
**Method:** Read-only. Detect originals in `PromptLibrary/*.md` whose text demands output-only responses ("only reply with", "nothing else", "no explanations"), then inspect the corresponding `PromptLibrary-3.0/XML/*.xml` output specification for an exposed reasoning, draft, or critique block. Zero model tokens spent.

## Result

| | Count |
|---|---|
| Originals demanding clean output-only | 47 |
| Of those, 3.0 exposes a process or reasoning block | **12** |
| Clean output preserved | 35 |

This is **not** systemic. It is concentrated, and the concentration is meaningful.

## Confirmed Drift (12)

| Prompt | Trigger in 3.0 output spec | Status |
|---|---|---|
| linux_terminal | `**Reasoning**` prefix | needs fix |
| sql_terminal | `**Reasoning**` prefix | needs fix |
| php_interpreter | `**Reasoning**` prefix | needs fix |
| r_programming_interpreter | `**Reasoning**` prefix | needs fix |
| solr_search_engine | `**Reasoning**` prefix | needs fix |
| girl_of_dreams | `**Reasoning**` prefix | needs fix |
| job_interviewer | `**Reasoning**` prefix | needs fix |
| spongebob_s_magic_conch_shell | `**Reasoning**` prefix | needs fix |
| commit_message_generator | `**Critique**` block | needs fix |
| regex_generator | `**Critique**` block | needs fix |
| biblical_translator | `## Draft` section | ALREADY FIXED in 4.0 |
| food_critic | `## Draft` section | ALREADY FIXED in 4.0 |

**The dominant cluster is terminal and interpreter simulators.** `linux_terminal`, `sql_terminal`, `php_interpreter`, `r_programming_interpreter`, and `solr_search_engine` are five of the twelve. These are precisely the prompts where "output only, nothing else" *is* the product. A reasoning preamble does not merely add noise, it breaks the simulation.

Canonical case, verified by hand:

- **Original:** "I want you to only reply with the terminal output inside one unique code block, and nothing else."
- **3.0 output spec demonstrates:** `**Reasoning**: pwd prints the current working directory...` followed by the code block.

## Root Cause

The 2.0 and 3.0 passes added Self-Refine and Chain-of-Thought scaffolding broadly, and the v4 template's own `output-style` default is `full-process` (Draft + Critique + Final + Process Summary). Reasoning intended to run *internally* leaked into the *output specification*, usually by way of a worked example that demonstrates the wrong shape. Because the leak looks like added rigor, it survived two upgrade passes unnoticed.

## Fix Pattern

The `food_critic` upgrade established the correct resolution: keep the Self-Refine and reasoning machinery running internally, make clean output the default, and expose the process trail only under an explicit user override. Reasoning quality is retained; the output contract is honored.

Apply the same pattern to the 10 outstanding files during their Stage 1 upgrade.

## Correction: the count is a floor, not a total

**Added after Stage 1 agents found a case this sweep missed.**

`guessing_game_master` had confirmed output-format drift (3.0 made a full visible Tree Exploration plus Self-Refine audit the default output) and this sweep never flagged it, because it never even entered the candidate set.

The reason: the sweep's first filter looked for explicit permission language ("only reply with", "nothing else", "no explanations"). But `guessing_game_master` states its contract as an exact **format specification** instead:

> "Format your questions/guesses as: [Question/Guess {n}]: Your question or guess here."

A prompt that pins an exact output shape is making the same clean-output contract without using the word "only". That whole phrasing class was invisible to the filter.

**Bounded follow-up:** re-running with a format-contract pattern added found exactly **one** additional file, `guessing_game_master` itself. So this is a single miss, not a hidden category. Confirmed drift count becomes **13**.

Note that candidate-set sizes differ between runs (47 vs 37) because the two passes used different first-filter regexes. The confirmed-drift list is the stable number; the candidate count is not directly comparable across runs.

**Validation of the rest:** two files from the flagged list have since been processed by Stage 1 agents doing an independent semantic check, and both confirmed the sweep. `girl_of_dreams` and `job_interviewer` were each found drifted and fixed. `language_detector`, which this sweep marked clean, was independently verified clean. The detector's positives and negatives are both holding up so far.

## Detector Caveat

The first version of this detector reported 41 of 47, which was a false-positive rate driven by matching `<Draft>` anywhere in the file including internal reasoning sections. Scoping to the output specification dropped it to 2. Spot-checking then revealed false *negatives*: `sql_terminal` was being missed because the pattern did not include `**Reasoning**` prefixes. The final pattern covers Draft, Critique, Reasoning, Analysis, and Thinking headers within the output spec only.

Both correction rounds were caught by manual spot-checking rather than by the detector itself. Treat the 12 as high-confidence and the 35 "clean" as good-but-not-proven. Any further verification would need a semantic pass rather than pattern matching.

## Not Covered by This Sweep

This sweep finds **output-format drift** only. It cannot detect **task redirects**, where the 3.0 version does a different job than the original. Two such cases were found incidentally during Stage 1 upgrades:

- `biblical_translator`: original was a style-transfer request (rewrite text in biblical prose); 3.0 reinterpreted it as scripture translation.
- `character`: original was act-as-a-fictional-character roleplay; 3.0 became an elaborate Tree-of-Thought character-design tool.

Both were caught only because an agent happened to read the original alongside the 3.0 source. That check is now a required Stage 1 step (`intent_drift_found` in the manifest), so the remaining 142 get it automatically. The 82 already upgraded did not all receive it, and the first 47 from wave 1 definitely did not.

**Recommendation:** a semantic drift check over the 47 wave-1 files would need agent time, unlike this sweep. Worth doing, but it is not free.
