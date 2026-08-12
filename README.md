# EngineeredPromptLibrary

A working archive of applied prompt engineering and context engineering research. Multiple versioned libraries, master templates, performance benchmarks, an in-depth original research paper on reasoning strategies, and the cognitive tools that grew out of all of it.

This repo is the foundation layer of a broader body of work. The methodology developed here informed the design of [AIOrchBuilder](https://github.com/princemanjee/AIOrchBuilder), the multi-agent orchestration framework, and through it the production application FieldForce Tool Tracker. If you want the through-line, this is where it starts.

## Featured: Reasoning Strategies for AI Decision Making

The most polished single artifact in this repo is the paper **"Reasoning Strategies for AI Decision Making: A Practical Guide"**. It analyzes how different reasoning architectures (single-path, multi-path, self-refinement, tool-use, and abstraction-based approaches) perform across cost, accuracy, latency, and reliability dimensions. The paper is available in four formats in the repo root (HTML, DOCX, PDF, ODT) and also published on Medium for general reading.

Companion video walkthroughs explain the underlying ideas in depth:

- **Architecting LLM Reasoning: From Cognitive Templates to Complete Systems** (`Architecting_LLM_Reasoning__From_Cognitive_Templates_to_Complet.mp4`)
- **Engineering LLM Cognition: From Prompts to Neural Fields** (`Engineering_LLM_Cognition__From_Prompts_to_Neural_Fields.mp4`)

Performance comparison visualizations across reasoning architectures live in the repo root:

- `Abstraction-Performance.png`
- `MultiPath-Performance.png`
- `SelfRefinement-Performance.png`
- `SinglePath-Performance.png`
- `ToolUse-Performance.png`
- `CostVAccuracy.png` and `CostVAccuracy2.png` for the cost-versus-accuracy tradeoff plots
- `chart_strategy_landscape.html` and `chart_strategy_radar.html` for interactive versions

## What's in this repo

### The PromptLibrary evolution

Four numbered versions trace how the templates and patterns matured over time. The progression is genuine, not retroactive labeling. Each version was used in real work and superseded when its limits became visible.

- `PromptLibrary/` is the initial version (1.0), capturing the first patterns.
- `PromptLibrary-2.0/` introduces structural improvements and more disciplined input contracts.
- `PromptLibrary-3.0/` adds reasoning architecture options and tool-use patterns.
- `PromptLibrary-4.0/` is the current production version, incorporating lessons from the Reasoning Strategies paper.
- `PromptLibrary-XML/` is the XML-encoded variant for systems that need structured input or output rather than free-form markdown.

### Master templates and reusable patterns

`MasterTemplates/` contains the highest-leverage reusable patterns that show up across multiple projects, including the meta-context template (`!!MasterContextTemplate.xml`) that anchors most of the downstream work.

### Strategies and cognitive tools

`strategies/` holds named reasoning strategies treated as first-class artifacts (chain-of-thought variants, self-consistency, plan-and-solve, tree-of-thoughts adapted for production constraints).

`cognitive-tools/` contains the prompt-as-tool implementations, things that wrap a model invocation behind a structured input/output contract so it can be composed with other tools.

### Plugins

Two plugin directories ship with this work:

- `.claude-plugin/` is the plugin manifest for direct Claude integration.
- `prompt-library-plugin/` is a portable plugin distribution.

Plugin source includes utility scripts (`write_skills.py`, `fix_skill_order.py`) for managing skill ordering and packaging.

#### Monolith or task-scoped plugins

The marketplace publishes the same 226 skills two ways, and you enable whichever fits:

- **`prompt-library`** is the monolith. All 226 skills in one plugin. Loading everything costs roughly 14.7k tokens of skill-listing space, which overruns the listing budget and truncates skill descriptions, so this is best for browsing rather than daily use.
- **`plugins/pl-*`** are 23 task-scoped plugins, 4 to 28 skills each. Enable only the ones matching the work in front of you. A typical engineering plus writing selection runs under 3k tokens.

`prompt-library-plugin/skills/` is the **single source of truth**. The `pl-*` plugins are generated from it and are wiped and rebuilt on every run, so never hand-edit a skill under `plugins/`.

To upgrade the monolith and trickle the change down:

```bash
# 1. edit or add skills in prompt-library-plugin/skills/
# 2. if you added a skill, assign it to a group in groups.json
node scripts/split.mjs --check   # validate the mapping, write nothing
node scripts/split.mjs           # rebuild all 23 child plugins + marketplace.json
```

The script fails loudly rather than silently dropping work: it errors if any skill is unassigned, assigned to two groups, or named in `groups.json` but absent from the monolith.

`groups.json` holds the mapping. Moving a skill between plugins is a one-line edit there followed by a rebuild.

### Examples and guidelines

- `examples/` shows the templates in action on real tasks.
- `Guidelines/` documents the conventions and design choices that hold across the library.
- `PRPs/` contains Product Requirements Prompts, structured specifications for technology-specific builds.

### Supporting artifacts

- `iNFOGRAPHIC.png` is the overview visualization for the library.
- `INITIAL.md` is the starter notes that document how the project began.
- `SoftwareRefinementPrompt.md` and `.xml` are stand-alone refinement prompts that have been used on real codebases.
- `TaskInstructions.md` documents how to use the library in agent-driven workflows.

## Influences and acknowledgments

This work is informed by the public output of several researchers and practitioners working at the intersection of large language models and reasoning architecture. Notably:

- **Andrej Karpathy's** writing and lectures on the shift from prompt engineering to context engineering as a first-class discipline.
- **Cole Medin's** work on multi-agent systems and his community around applied AI engineering.

Any errors and design choices in this repo are entirely my own; the credit for the underlying ideas belongs to the people who put them into the public domain.

## Status

This is an active, working archive rather than a polished open-source distribution. Some folders are stable and battle-tested (PromptLibrary-4.0, MasterTemplates, cognitive-tools). Others are research scratchpads still being refined. The Reasoning Strategies paper and the performance visualizations are the most reusable single artifacts for someone arriving fresh.

If you want to use a specific pattern from the library in your own work, the recommended entry points are:

1. Read the **Reasoning Strategies for AI Decision Making** paper for the conceptual framing.
2. Look at `PromptLibrary-4.0/` for the current production templates.
3. Look at `MasterTemplates/` for the highest-leverage reusable patterns.

## Related work

This repo is one of three connected projects:

1. **EngineeredPromptLibrary** (this repo) is the prompt and context engineering foundation.
2. **[AIOrchBuilder](https://github.com/princemanjee/AIOrchBuilder)** is the multi-agent orchestration framework built on the foundations here.
3. **FieldForce Tool Tracker** is the production-grade application built using the AIOrchBuilder methodology. Case study at princerehman.com/work/fieldforce.

## Author

Built and maintained by **P. R. Manjee**. Digital transformation consultant focused on AI adoption, cloud modernization, and applied research at the intersection of prompt engineering and operational AI. MIT Sloan (MS Digital Transformation), MIT (MS Information Systems), Notre Dame (BS Electrical Engineering). [princerehman.com](https://princerehman.com).

## License

See [LICENSE](LICENSE).
