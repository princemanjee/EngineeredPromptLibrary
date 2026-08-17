# PromptLibrary 4.0 Upgrade Report

**Run started:** 2026-08-16 13:49 CDT
**Status as of 2026-08-16 17:55 CDT:** 47 prompts complete in both formats and verified. 177 remain.
**Scope:** 224 prompts total in PromptLibrary-3.0, each to be upgraded to 4.0 in both XML and Markdown.
**Method:** Parallel sub-agent waves applying `MasterTemplates/context-engineering-template-v4.xml` / `.md`. Style exemplar: `PromptLibrary-4.0/XML/storyteller.xml`. 3.0 best-in-class reference: `PromptLibrary-3.0/XML/it_architect.xml`.

## Current Completion State

| Metric | Count |
|---|---|
| Prompts with 4.0 XML | 47 of 224 (21%) |
| Prompts with 4.0 Markdown | 47 of 224 (21%) |
| Complete pairs (XML + MD) | 47 |
| XML done, Markdown missing | 0 |
| Not yet started | 177 |

Every prompt currently in `PromptLibrary-4.0/` exists in both formats, with no orphans in either direction.

## Markdown Backfill Pass (Sonnet, 4 concurrent)

Eight prompts had completed 4.0 XML but no Markdown counterpart after the wave-1 interruption. These were backfilled by rendering the finished 4.0 XML into Markdown, treating the XML as authoritative rather than re-deriving from 3.0. This guarantees the two formats agree and costs a fraction of a full authoring pass.

| Prompt | Duration (s) | XML 4.0 lines | MD 3.0 lines | MD 4.0 lines |
|---|---|---|---|---|
| elocutionist | 150 | 1133 | 588 | 654 |
| cover_letter | 158 | 1383 | 543 | 733 |
| screenwriter | 158 | 1301 | 614 | 659 |
| code_review_assistant | 176 | 1191 | 707 | 705 |
| ai_assisted_doctor | 181 | 1251 | 697 | 665 |
| chemical_reactor | 191 | 1452 | 822 | 773 |
| novelist | 198 | 686 | 535 | 654 |
| debate_coach | 207 | 1537 | 651 | 809 |

**Mean render time: 177 seconds per file.** All 8 agents completed without error. No XML files were modified during this pass (verified via `git status`). Per-file metrics were appended to `PromptLibrary-4.0/.metrics.jsonl` immediately on completion, which is the durability fix described below.

Configuration comparison, useful for planning the remaining 177:

| Pass | Model | Concurrency | Outcome |
|---|---|---|---|
| Wave 1 (full authoring) | Opus | 10 | Session limit exhausted after 41 prompts |
| Backfill (XML to MD render) | Sonnet | 4 | 8 of 8 completed, no failures |

## XML Validity

All 47 files in `PromptLibrary-4.0/XML/` parse as well-formed XML (verified with `xml.dom.minidom`).

Five escaping defects were found and repaired during verification. All were unescaped characters in text content or attribute values:

| File | Issue | Fix | Origin |
|---|---|---|---|
| academician.xml | `&` in "Orben & Przybylski" (2 occurrences) | `&amp;` | Pre-existing |
| academician.xml | `&` in "Escalation & Handoff" | `&amp;` | Pre-existing |
| academician.xml | Raw `<=` in metrics table (2 occurrences) | `&lt;=` | Pre-existing |
| dietitian.xml | Raw `<=` in metrics table | `&lt;=` | This run |
| stand_up_comedian.xml | Raw `<=` in `target` attribute | `&lt;=` | Pre-existing |

The `--`-in-comments rule was followed correctly by all agents: no violations found. Decorative banners use the `══` convention.

**Lesson for remaining waves:** the recurring failure is not `--` but raw `<=` and `&` in metrics tables and prose. Agent instructions must explicitly require `&lt;=` and `&amp;`, and every agent must run a real parser check, not a visual one.

## Line Count Analysis (47 completed prompts)

| Aggregate | 3.0 | 4.0 | Change |
|---|---|---|---|
| Total XML lines | 43,376 | 57,538 | +14,162 (+32%) |
| Mean XML lines per prompt | 923 | 1,224 | +301 (+33%) |

Growth is concentrated in the v4.0 additions: Principles, Input Validation Protocol, Error Recovery Protocol, persona behavioral guidance, strategy failure modes, convergence heuristics, and Prompt Testing.

Notable outliers, where 3.0 was thin and 4.0 added the most structure:

| Prompt | XML 3.0 | XML 4.0 | Growth |
|---|---|---|---|
| buddha | 606 | 1,394 | +130% |
| debate_coach | 644 | 1,537 | +139% |
| cover_letter | 597 | 1,383 | +132% |
| chief_executive_officer | 595 | 1,272 | +114% |
| children_s_book_creator | 576 | 1,195 | +107% |
| developer_relations_consultant | 585 | 1,206 | +106% |
| diagram_generator | 599 | 1,148 | +92% |

Prompts that barely grew were already near-complete in 3.0, or are genuinely simple and correctly took the Simple/Medium route rather than being padded:

| Prompt | XML 3.0 | XML 4.0 | Growth |
|---|---|---|---|
| automobile_mechanic | 1,215 | 1,213 | -0.2% |
| stand_up_comedian | 918 | 904 | -1.5% |
| ai_writing_tutor | 1,239 | 1,279 | +3% |
| drunk_person | 438 | 651 | +49% (correctly kept small) |

Full per-prompt line counts are in the appendix table below.

## Data Lost in the Interruption

All ten wave-1 agents were terminated by the session token limit before returning their result payloads. The following planned metrics were **not** recovered for the 41 prompts upgraded in this run:

- Per-prompt upgrade duration
- Agent-assigned quality scores for 3.0 vs 4.0 across the seven template dimensions
- Declared reasoning strategy for 3.0 vs 4.0, and strategy-change rationale
- Complexity route selected

Line counts were reconstructed from disk. Scoring and strategy data would require a separate read-only scoring pass over the completed files, which is cheap relative to generation and can be run independently.

**Process fix:** future agents must append their per-prompt JSON result to a file on disk immediately after each prompt completes, rather than accumulating results in context and returning them at the end. An agent killed mid-run then loses at most one prompt's metrics instead of all six.

## Capacity Analysis (why the run halted)

The wave-1 configuration was 10 concurrent Opus-tier agents, each generating roughly 1,200 lines of XML plus 600 lines of Markdown per prompt. Across 41 completed prompts that is approximately 74,000 lines of generated output in about 30 minutes, which exhausted the session token budget.

Observed throughput: **~41 prompts per session window.**
Remaining work: **177 prompts** (plus 8 Markdown backfills).
Projected: **~4.3 additional session windows** at the wave-1 configuration.

Options to change that arithmetic are listed in the Next Steps section.

## Per-Prompt Line Counts

| Prompt | XML 3.0 | XML 4.0 | MD 3.0 | MD 4.0 |
|---|---|---|---|---|
| academician | 999 | 1256 | 597 | 907 |
| accessibility_auditor | 874 | 1252 | 583 | 662 |
| accountant | 789 | 1201 | 667 | 640 |
| acoustic_guitar_composer | 743 | 1158 | 561 | 596 |
| advertiser | 878 | 1240 | 652 | 548 |
| ai_assisted_doctor | 1067 | 1251 | 697 | missing |
| ai_writing_tutor | 1239 | 1279 | 677 | 648 |
| any_programming_language_to_python_converter | 871 | 1210 | 657 | 647 |
| aphorism_book | 1199 | 1332 | 678 | 728 |
| ascii_artist | 1002 | 1073 | 597 | 640 |
| astrologer | 1051 | 1193 | 613 | 640 |
| automobile_mechanic | 1215 | 1213 | 732 | 648 |
| ayurveda_food_tester | 834 | 1171 | 580 | 632 |
| book_summarizer | 1092 | 1313 | 630 | 583 |
| buddha | 606 | 1394 | 574 | 525 |
| car_navigation_system | 1093 | 1311 | 705 | 494 |
| career_coach | 1188 | 1281 | 619 | 486 |
| chatgpt_prompt_generator | 1009 | 1250 | 569 | 649 |
| cheap_travel_ticket_advisor | 1077 | 1353 | 700 | 610 |
| chef | 941 | 1319 | 603 | 600 |
| chemical_reactor | 1150 | 1452 | 822 | missing |
| chief_executive_officer | 595 | 1272 | 575 | 711 |
| children_s_book_creator | 576 | 1195 | 593 | 681 |
| classical_music_composer | 1158 | 1220 | 727 | 638 |
| code_review_assistant | 777 | 1191 | 707 | missing |
| commit_message_generator | 933 | 1260 | 621 | 759 |
| composer | 898 | 1411 | 589 | 688 |
| conventional_commit_message_generator | 817 | 1159 | 586 | 673 |
| cover_letter | 597 | 1383 | 543 | missing |
| data_scientist | 1201 | 1628 | 749 | 688 |
| data_transformer | 927 | 1311 | 661 | 613 |
| dax_terminal | 913 | 1285 | 544 | 649 |
| debate_coach | 644 | 1537 | 651 | missing |
| developer_relations_consultant | 585 | 1206 | 592 | 643 |
| devops_engineer | 1140 | 1291 | 615 | 672 |
| diagram_generator | 599 | 1148 | 558 | 614 |
| dietitian | 1069 | 1167 | 642 | 625 |
| doctor | 1101 | 1226 | 658 | 575 |
| dream_interpreter | 1104 | 1137 | 619 | 520 |
| drunk_person | 438 | 651 | 475 | 406 |
| educational_content_creator | 925 | 1055 | 604 | 491 |
| elocutionist | 1003 | 1133 | 588 | missing |
| novelist | 536 | 686 | 535 | missing |
| screenwriter | 1082 | 1301 | 614 | missing |
| stand_up_comedian | 918 | 904 | 587 | 598 |
| stand_up_comedian2 | 963 | 1044 | 600 | 763 |
| storyteller | 960 | 1235 | 656 | 815 |

## Next Steps

1. ~~Backfill the 8 missing Markdown files.~~ Done. All 47 prompts are complete in both formats.
2. Decide the model and concurrency configuration for the remaining 177 prompts (see Capacity Analysis).
3. Resume waves with the disk-append metrics protocol and the explicit `&lt;` / `&amp;` escaping rule.
4. Optionally run a separate read-only scoring pass over completed files to recover the lost quality-dimension data.

**Safety flag for remaining work:** a small number of prompts in the 3.0 library exist specifically to defeat AI safety controls, most clearly `unconstrained_ai_model_dan`. Edgy persona and roleplay prompts (`gaslighter`, `drunk_person`, `ai_trying_to_escape_the_box`, `lunatic`) are ordinary character work and will be upgraded normally. Any prompt that is literally a jailbreak instruction set will be listed here for a decision rather than silently skipped.

## Current State Is Committable

- 47 of 224 prompts upgraded, both formats, no orphans
- All 47 XML files parse as well-formed (verified with a real parser, not visual inspection)
- 5 escaping defects found and repaired, 4 of which predate this run
- Per-file metrics captured in `.metrics.jsonl` for the backfill pass
