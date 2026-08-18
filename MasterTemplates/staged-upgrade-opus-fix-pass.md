# Staged Upgrade Pipeline: Opus Targeted Fix Pass

Reusable prompt for the senior review stage of the Jr/Sr staged authoring pipeline.

## The Pipeline

```
Stage 1  Sonnet authors the v4.0 upgrade from the 3.0 source     (bulk work, cheap tokens)
Stage 2  Mechanical pass: em-dash strip + XML parse + "--" scan   (deterministic, zero model cost)
Stage 3  Opus targeted fix pass, using the prompt below           (judgment only, surgical edits)
Stage 4  Spot-check a sample against the rubric
```

**Never spend model tokens on Stage 2.** Em dashes, XML escaping, and `--`-in-comments are regex problems. Paying a model to find them is waste.

## Measured Results (it_expert, 2026-08-16)

| Approach | Rubric mean | Behavior situations | Opus tokens | Sonnet tokens |
|---|---|---|---|---|
| Sonnet solo | 91.3 | 5 | 0 | 150,120 |
| Opus solo | 95.0 | 6 | 145,403 | 0 |
| **Staged** | **96.0** | **8** | **91,740** | **150,120** |

Staged beat solo Opus on quality while using 37% fewer Opus tokens. Roughly 16% total cost savings at a 5:1 price ratio, so the primary benefit is quality, not cost.

**Why staged beats solo Opus:** critiquing a concrete artifact is a different cognitive task than authoring one. With a real draft present, the senior pass finds gaps it would not have thought to generate from a blank page. Two of the strongest additions in the test (data-preservation ordering when the user already took a destructive action, and phone-readable instructions when the broken device is the only device) appeared in neither solo run.

## The Prompt

Replace `{{TARGET_FILE}}` and `{{DOMAIN_HINT}}`. Run with model: opus.

---

You are a Senior Prompt Engineering Architect performing a SURGICAL improvement pass on a v4.0 Context Engineering prompt file that was drafted by a junior author.

TARGET FILE (edit in place): `{{TARGET_FILE}}`

REFERENCE: `MasterTemplates/context-engineering-template-v4.xml` (authoritative standard)

CRITICAL CONSTRAINT ON YOUR METHOD:
Use the Edit tool for every change. Do NOT use Write. Do NOT rewrite the file wholesale. Do NOT restructure sections that are already adequate. Your value is precision, not volume. A pass that rewrites everything has failed, because the draft is already structurally sound and rewriting it discards the cost advantage of the staged approach.

The draft is competent. Fix these three specific weaknesses that junior-drafted files exhibit:

**DEFECT 1: Circular or unenforceable calibration anchors.**
An anchor is broken when an independent reader cannot check it. "All commands verified correct and current" is circular: it names no verifier and no procedure. Rewrite these so they are applicable, and so they specify fallback behavior when the ideal cannot be met. Strong pattern: state what to do when the model cannot confirm something, rather than asserting the confirmation happened. Standard to aim for: "any path that cannot be confirmed is replaced by the setting name plus a search instruction rather than a guess."

**DEFECT 2: 95% anchors that describe formatting instead of reasoning.**
A weak 95% anchor stops at appearance ("expected outcome stated"). A strong one describes what the output must reason about ("states what success looks like AND what a non-result implies for the next diagnostic step"). Upgrade surface-structure anchors into ones that require inference.

**DEFECT 3: Missing domain-inferred content.**
The template prescribes a generic checklist of persona behavioral situations (ambiguous input, insufficient information, conflicting requirements, edge case, pushback). A senior author asks what THIS domain additionally demands that the generic template never anticipated. {{DOMAIN_HINT}} Add what genuinely belongs; do not pad.

ALSO CHECK while reading (cheap):
- Any v4 template section entirely absent that should be present.
- Any threshold stated without a number.
- Any contradiction between a global quality threshold and per-dimension thresholds.

HARD RULES:
- XML comments must NEVER contain `--`. Use `══`, `~~~~`, or `====` for banners.
- Escape `&` as `&amp;` and `<` as `&lt;` in all text content and attribute values, including `&lt;= 3` in tables.
- Do not introduce em dashes. Use commas, colons, or parentheses.
- Validate before finishing, and fix and re-run until clean:
  `python -c "import xml.dom.minidom; xml.dom.minidom.parse('{{TARGET_FILE}}')"`

FINAL OUTPUT: Return only compact JSON, no prose:
```
{"edits_made":n,"defect1_anchors_fixed":n,"defect2_anchors_deepened":n,
 "defect3_content_added":["short label per addition"],"other_fixes":["short label"],
 "lines_before":n,"lines_after":n,"parses":true|false,
 "assessment":"one sentence on whether the draft needed heavy or light intervention"}
```

---

## Design Notes

**Why force Edit instead of Write.** Given the ability to rewrite, a reviewer will. Then you pay senior authoring rates on top of the junior draft you discarded, which is worse than either pure approach. Restricting the tool makes surgical work the path of least resistance. The reported token count is the check on whether it held: a pass that balloons toward solo-authoring cost has failed its constraint.

**Why name the defects instead of saying "review this."** Open-ended review of a plausible, well-formatted file produces a rubber stamp. The reviewer needs something specific to hunt. Critically, these three defects were not guessed: they were measured by running both models on the same source and diffing the outputs. Any adaptation of this pipeline to a new task type should start by measuring where the junior model actually falls short, rather than assuming.

**Generalizing to other task types.** The pattern is: junior supplies structure and coverage, senior supplies judgment and the things a checklist cannot specify. It should transfer wherever work has a knowable structure plus a layer of expertise visible only in details, including code review, technical documentation, and analysis. The load-bearing element is the measured defect list, not the model tiers.
