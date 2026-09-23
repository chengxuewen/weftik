# AGENTS.md — Weftik Project Knowledge Base

**Generated:** 2026-07-13
**Commit:** `dae532d`
**Branch:** `main`
**Branch:** `main`

## OVERVIEW
Weftik — 面向工业自动化与机器人的统一开发与运行时框架（品牌改名自 AUDESYS，D118）。聚焦 Studio IDE、Runtime、Simulator、HAL。当前 24 crates、6 IEC 61131-3 编译器 + G-code、Theia Studio IDE。Panel/HMI UI 属外部项目，Runtime 保留 IPC 契约（D117）。

## STRUCTURE
```
Weftik/
├── .opencode/          # OpenCode 配置（插件、MCP、LSP、instructions）
│   ├── opencode.json   # 主配置：模型、插件、44 条 instructions、6 个 MCP、8 个 LSP
│   ├── agent-guide.md  # 554 行 — AI 代理使用指南（5 层模型体系、OMO 编排）
│   └── init-mcp-*.mjs  # 7 个 MCP 自动安装脚本（codegraph/playwright/shadcn/tailwind/lucide/postgres）
├── .agents/
│   ├── rules/          # 89 个编码规则文件（16 语言 × common + 中文副本）
│   ├── skills/         # 22 个技能（design-system + 11 openspec-* + 4 ref-* + book-to-skill + doc-audit + ecosystem-scan + lesson-review + skill-router + skill-creator + test-harness + think-before-act）
│   └── memorys/        # 4 个项目记忆文件（status/conventions/decisions/pitfalls）
├── docs/
│   ├── architecture.md           # ~1,700 行 — 系统架构概览（6 主章）
│   ├── modules/                  # 按模块组织的详细设计子文档
│   │   └── hal/                  # 19 份 HAL 子文档（独立维护，覆盖 17 个设计主题）
│   ├── reference/                # 41 篇竞品参考文档（12 大类别）
│   ├── plans/                    # P0 实施计划文档
├── openspec/           # OpenSpec 变更管理与 SDD 规范目录
│   ├── specs/                     # 9 份 SDD 规范文档（296 项，含历史参考章节）
│   └── changes/                   # 变更提案目录
├── SKILL.md            # 技能注册表（superpowers + 项目专属 + agents）
├── AGENTS.md           # 本文件 — 项目知识库入口
├── README.md           # 项目简介
├── package.json        # 极简：仅 `name: "weftik"` + `@colbymchenry/codegraph` 开发依赖
├── package-lock.json   # npm lock 文件
├── LICENSE             # Apache 2.0
└── .gitignore          # 排除 .sisyphus/
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 项目状态和阶段 | `.agents/memorys/status.md` | 模块状态表、已知缺失 |
| 架构决策 | `.agents/memorys/decisions.md` | D1-D19 + G1-G5 |
| 编码约定 | `.agents/memorys/conventions.md` | 命名、不可变性、TS 规范、HAL 设计约定 |
| 已知坑点 | `.agents/memorys/pitfalls.md` | MODACS 适配 + HAL 设计审核 |
| HAL 详细设计 | `docs/modules/hal/` | 19 份独立子文档：协议原语、amw、类型系统、线程调度、多语言等 17 个设计主题 |
| 架构文档 | `docs/architecture.md` | 系统级模块概览、HAL §一 精简到 168 行交叉引用 |
| 多语言策略 | `docs/modules/hal/multi-language-strategy.md` | Rust/C++/15 语言三层架构 + FlatBuffers |
| 语言规则 | `.agents/rules/{lang}/` | 各语言专属规则 |
| Agent 配置 | `.opencode/opencode.json` | instructions、MCP、LSP |
| Agent 使用指南 | `.opencode/agent-guide.md` | OMO 编排体系、5 层模型路由 |
| 技能注册表 | `SKILL.md` | superpowers + 项目专属技能清单 |
| 通用规则 | `.agents/rules/common/` | 安全、编码风格、测试、Git 工作流 |
| 参考文档库 | `docs/reference/` | 41 篇竞品分析（12 大类别），每篇 ≥800 行 |
| 安全规则 | `.agents/rules/common/security.md` | Secret management、XSS、CSRF |
| Runtime 设计文档 | `docs/modules/runtime/` | 4 份子文档：IPC安全、可观测性、硬件需求、升级策略 |

## CODE MAP

| 模块 | 状态 | 路径 |
|------|:----:|------|
| Studio IDE | ✅ Theia 迁移完成 | `apps/studio/` + `theia-extensions/` |
| Runtime Engine | ✅ 完成 | `crates/weftik-runtime/` |
| IPC Server | ✅ 完成 | `crates/weftik-runtime/src/ipc.rs`（无独立 crate） |
| Runtime Client | ✅ 完成 | `crates/weftik-runtime-client/` |
| Panel/HMI | 📦 移交（D117） | 契约 IPC 0x16/0x17/0x18（本仓保留） |
| LD Compiler | ✅ 完成 | `crates/weftik-ld-compiler/` |
| FBD Compiler | ✅ 完成 | `crates/weftik-fbd-compiler/` |
| ST/IL/SFC Compilers | ✅ 完成 | `crates/weftik-hal-binding-gen/` + `weftik-il-compiler/` + `weftik-sfc-compiler/` |
| G-code Compiler | ✅ 完成 | `crates/weftik-gcode-compiler/` |
| CNC Axis Group | ✅ 完成 | `crates/weftik-cnc-axis-group/` + `crates/weftik-cnc-motion/` |
| SimulationHarness | ✅ 完成 | `crates/weftik-runtime/` (in-proc harness) |
| HAL Core | 🟡 设计完成 | `crates/weftik-hal-core/` |
| Simulator (AVD) | 🔮 Phase 3/4 | 7 种虚拟设备 |

## VERTICAL SLICE: LD → Runtime → Panel

LD (Ladder Diagram) 编辑器到运行时面板的完整垂直切片（Panel 由外部项目实现，D117）：

| 层 | 组件 | 路径 | 状态 |
|----|------|------|:----:|
| Editor | LD Editor (React Flow, D110) | `theia-extensions/weftik-ld-editor/` | ✅ |
| Compiler | LD Compiler (LD to IL to HalProgram) | `crates/weftik-ld-compiler/` | ✅ |
| Runtime | Runtime Engine (5-step cycle + Hot-swap) | `crates/weftik-runtime/` | ✅ |
| IPC | IPC Server (UDS + HMAC, 0x01-0x18) | `crates/weftik-runtime/src/ipc.rs` | ✅ |
| Client | RuntimeClient (7 methods + auth) | `crates/weftik-runtime-client/` | ✅ |
| HMI | Panel（外部项目，经 IPC 0x16/0x17/0x18 契约接入） | 契约: `openspec/specs/hmi-spec.md` | 📦 移交 |

Data flow: `.ld` file → LdEditorWidget (React Flow) → LdOperationHandler.compile()
→ LdCompiler (LD grammar → IL tokens → HalProgram) → deploy_program (IPC 0x10)
→ RuntimeEngine (load + execute cycle) → signal values → external Panel
(IPC 0x16 push + 100ms poll fallback → Panel widgets).
## CONVENTIONS
### Weftik 独有
- **命名**: `Weftik` 全大写，npm scope `@weftik/`
- **去 MODACS 化**: 保持零 MODACS 残留，每次修改后运行 `grep -ri modacs . --exclude-dir=.git --exclude-dir=.sisyphus`
- **精确编辑**: 不全局 MODACS→Weftik 替换，使用手术式编辑
- **@modacs/* 移除**: 移除所有 `@modacs/*` 引用，不自动替换为 `@weftik/*`
- **文档组织**: 概览 → `architecture.md`，详细设计 → `docs/modules/{module}/` 子文档

### TypeScript
- 公共 API 显式类型注解
- `interface` 优先于 `type`（对象形状）
- `unknown` > `any`
- Zod 用于边界层模式验证
- 禁止 `as any` / `@ts-ignore` / `console.log`

### 通用
- 不可变性优先（永不突变，总是创建新副本）
- 小文件 > 大文件（200-400 行典型，800 行最大）
- 显式错误处理，无静默吞异常
- 布尔值前缀 `is`/`has`/`should`/`can`

## ANTI-PATTERNS (THIS PROJECT)
- **`as any` / `@ts-ignore`** — 永不使用，零例外
- **`console.log`** — 生产代码禁止
- **静默吞异常** — `catch(e) {}` 绝对不允许
- **对象突变** — 始终返回新对象，永不就地修改
- **全局 MODACS→Weftik 替换** — 使用精确的手术式编辑
- **硬编码密钥** — 使用环境变量或密钥管理器
- **不必要的文件写入** — 文档文件仅在用户明确要求时创建
- **引入第 4 种通信原语** — Signal/StreamChannel/RPC 已正交覆盖全部场景
- **引入完整 DDS QoS** — HalQoS 三个最小维度足以满足工业需求

## COMMANDS
```bash
# Studio 构建（yarn workspaces）
yarn install    # 安装依赖（yarn hoist 自动管理 @theia/* 依赖）
yarn theia build  # 构建 Theia 前端 bundle
#
yarn start      # 启动 Studio（Electron 模式）
node lib/backend/main.js --port=3100  # 浏览器模式
```

## NOTES
- **24 crates + Theia Studio** — 6 语言编辑器、HMI IPC 契约（0x16-0x18，Panel 属外部项目）、编译器、Runtime Engine、IPC Server、SimulationHarness、799+ 测试、296 SDD 规范项
- **从 MODACS 分离** — 2026-07-08 首次提交。无 MODACS 代码共享
- **.sisyphus/** 被 gitignore 排除 — 计划文件和证据不提交到仓库
- **双 package.json** — 根目录用 npm，`.opencode/` 用独立包（插件系统）
- **HAL 设计审核** — 3 专家 × 27 项发现，全部交互式确认，12 份独立文档合并为详细设计
- **Agent 超配** — 规则（89 个文件）和 MCP 服务器（7 个活动）是为未来开发准备的
- **test 基础设施** — 不存在。要求 80% 覆盖率、TDD、AAA 模式（在规则中声明，但无框架可执行）
