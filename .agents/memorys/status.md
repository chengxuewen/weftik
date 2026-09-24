# Weftik 项目状态

## 当前阶段
- **开发形态切换 CLI-first（2026-09-24）** — D119：Studio 功能冻结（不删除，theia build 保绿即止）；主开发界面 = weftik CLI + 任意编辑器（VS Code 薄扩展：语法高亮 + DAP）+ 纯文本 project.yaml；可视化买不造（MQTT/Grafana 先行，OPC UA 列 M2）；精力按序砸核心：25 回归修复→zenoh→RT 1ms→Modbus 真机→运动规划器→协议桥；M1 验收改 headless 全链路
- **Weftik 改名完成（2026-09-23）** — 全栈 AUDESYS→Weftik：24 crates / 9 扩展 / @weftik npm scope / fbs namespace / WEFTIK_* env / weftik_runtime_* 指标 / CLI；单主线 = 公开仓 gitee.com/chengxuewen/weftik（D118）。隔离 25 个既有回归测试待独立修复（见 pitfalls 清单）
- **Weftik Phase -1 UI 移除完成（2026-09-23）** — AUDEDeck(43 文件)/hmi-designer/studio-core/napi HMI 三函数/设计器规范整块删除（提交 2958f54，-27.5k 行）；Runtime HMI 契约保留（IPC 0x16/0x17/0x18 + Role::Hmi），Panel/UI 由外部项目主导（D117）
- **工程项目管理（A7 + 无 workspace 创建）完成（2026-08-10）** — New Weftik Project 向导（D114 工程组织模型）：目录约定 + project.yaml 清单 + 一 POU 一文件。修复「无 workspace 无法建工程」：改为从零创建（默认 ~/Weftik-Projects/，EnvVariablesServer 解析 home）+ 自动打开 workspace。菜单上浮 File 顶层（D115）。E2E 门禁通过（15.9s）。详见 D114/D115/D116
- **LD 编辑器拓扑 bug 修复完成（2026-08-05）** — D112 拓扑化后 3 个 bug 修复：(1) 拖动元素后连线消失（reorderElement 删线不重建串联）→ 新增 rewireRungSeries；(2) 跨 rung 误删连线（filter 含全局 rail id，rail 跨 rung 共享）→ 只按本 rung 元素 id 过滤；(3) 线圈放置失败（addCoil 保留自由放置位置校验，UI 拓扑路径不传 position 必抛错）→ 移除位置校验，coil 拓扑化追加。vitest 144/144。详见本项目 pitfalls.md
- **LD/IL 编辑器改进完成** — 2026-07-31，Phase 1-2 完成：IL 编译器新增 S/R/NOT/MOD/定时器/计数器/边沿/双稳态 (33 助记符)、LD 并联分支 (| NO/NC→OR/ORN)、多输出、P/N 跳变触点、rung:group 视图、3 个 GLSP 操作 Handler。63 测试通过 (31 LD + 32 IL)。详见计划 .sisyphus/plans/ld-editor-improvements/
- **FBD GLSP 迁移完成** — 2026-07-31，FBD 编辑器从 React+SVG 迁移到完整 Eclipse GLSP 架构。14 新文件、GPort 端口系统、5 种逻辑门 IView、36 测试全通过。详见 D107。⛔ GLSP 后于 D110 整体移除改 React Flow
- **Yarn Workspaces 迁移完成** — 2026-07-31，Studio 从 npm + file: link + 两步构建迁移到 Theia 官方 Yarn Workspaces monorepo。消除 `build-glsp.sh` 两步构建 workaround，Symbol 重复问题永久解决。构建流程：`yarn install && npx theia build`。
- **HMI Designer 暂时禁用** — 2026-07-31，因 vitest 依赖解析问题从 apps/studio/package.json 移除 weftik-hmi-designer。⛔ 终态 by D117：设计器已整体删除，不再重新启用
- **Theia 迁移完成** — 2026-07-21，Studio IDE 从 Tauri+React 迁移到 Eclipse Theia+Monaco Editor+GLSP+napi-rs。6 语言编辑器就绪：ST Monaco ✅、IL Monaco ✅、G-code Monaco ✅、LD GLSP 编辑器 ✅、FBD GLSP 编辑器 ✅、SFC 编辑器 ✅。Signal Browser ✅、Scope View ✅、Debug Panel ✅、HMI Designer (Theia) ✅、Mode System ✅。⛔ 后续变更：LD/FBD GLSP 编辑器已被 D110 移除改 React Flow；HMI Designer 与 AUDEDeck 已被 D117 删除（D65 已取代）
- **Studio ↔ Runtime 集成完成** — RuntimeClient 库（UDS IPC 客户端，6 方法+认证）、Studio napi-rs bridge 命令（deploy_program/load_hal_config/read_controller_signal）
- **协议适配器就绪** — Modbus RTU/TCP（8 测试）、HART（6 测试）
- **仿真器就绪** — SimulationHarness + 故障注入引擎 + 场景录制/回放 + VirtualModbusTcpDevice + VirtualHARTDevice
- **可观测性就绪** — Prometheus metrics + DAP 调试适配器（12 命令）+ JSON 日志
- **CNC 设计完成** — 2026-07-19，`docs/modules/cnc/` 5 份设计文档（G-code 编译器、运动规划器、轴组管理、竞品参考模型、插补引擎）+ 41 项 CNC SDD 规范 + architecture.md §七 CNC 章节
- **AUDEDeck 架构设计完成** — 2026-07-19，5 层架构（Shell/Plugin/WidgetRenderer/SignalBridge/Transport）、4 内置插件、PC/Web 双形态、SignalProvider TS 接口、7 项架构决策（D60-D66）。⛔ AUDEDeck 本体已于 2026-09 移除（D117），仅 Role::HMI 与 IPC 通道保留为契约
- **SCADA 性能分析完成** — 2026-07-19，基于 8 家竞品（Ignition/FUXA/InTouch/iFIX/KingView/Beckhoff/CODESYS/LabVIEW）的 Web HMI 渲染性能、大数据处理、图表优化、认知负荷分析，生成 18 项优化建议（P1 8 项 + P2 7 项 + P3 3 项）、8 项陷阱清单
- **HMI 设计器就绪** — 2026-07-19，可视化拖拽编辑器（react-rnd 自由布局画布）、7 种工业 widget（Gauge/Trend/Tank/Indicator/Button/Display/Text）、信号绑定对话框（controller_signal_snapshot 集成）、属性面板（位置/尺寸/标签/信号/类型专属配置）、Edit/Preview 模式切换、YAML 持久化（save_hmi_layout/load_hmi_layout）

## 仓库状态
- **最新提交**: 改名链 — 代码面主体 `1d4341f` feat(rename)! / 文档面 `5e23949`；本地领先 origin 未 push（门禁全绿后才推）
- **提交历史**: 399+ commits on main (2026-07-08 起，公开仓自 v0.1.0 发布后继续)
- **源代码**: 24 crates（crates/）。apps/studio/ 已由 Tauri 应用改建为 Theia 应用（D71）；AUDEDeck 已移除（D117）
- **测试**: 全 workspace cargo test 绿（25 个既有回归 #[ignore] 隔离：G1 梯形 7 + ST→IR 代码生成 18（控制流/运算符/定时器）；另有 1 个无关长期 IPC shutdown flaky 不计入 25）；vitest 160 (LD) + 26 (FBD)；Playwright E2E 72/72（🧊 D119：冻结件回归保险丝，仅修核心改动引起的失败）
- **SDD 规范**: openspec/specs/：类型系统(30) + HalQoS(30) + Config Barrier(24) + 协议(37) + CNC(41) + HMI 契约(13，设计器段已随 D117 删除) + Studio Theia(54) + 编辑器规范若干（codesys-workflow 30 + ld 系 37）
- **CI**: 本地 qa-fast 5 门禁（test/clippy/fmt/deny/unwrap）；GitHub workflows 已删（D-c：暂不要 CI，Gitee origin 下从未触发）
- **依赖**: Rust toolchain stable + yarn workspaces（codegraph devDep 已摘，MCP 由 init 脚本自愈安装）

## 模块状态

| 模块 | 状态 | 备注 |
|------|:----:|------|
| ST 编译器 + HAL IR/VM | ✅ 完成 | 34 操作码，7 控制流，函数调用栈。ST 编译位于 weftik-hal-binding-gen（原 hal-binding-gen 扩展为完整 ST-HalProgram 编译器），非独立 crate
| IL 编译器 | ✅ 完成 | 21 IL 助记符 → HalProgram |
| LD 编译器 | ✅ 完成 | LD 图形 → IL 文本 → HalProgram |
| FBD 编译器 | ✅ 完成 | 功能块图 to HalProgram。2026-07-23 修复: 加入 workspace members
| SFC 编译器 | ✅ 完成 | 19 步进 → HalProgram |
| Runtime Engine | ✅ 完成 | 5 步周期，Config Barrier，Hot-swap，信号注册表 |
| Supervisor | ✅ 完成 | 子进程编排，指数退避，3 重试 |
| IPC Server | ✅ 完成 | UDS 24 方法（0x01-0x18），HMAC 认证，5 角色 RBAC |
| Studio IDE | 🧊 冻结（D119） | D71 Theia 迁移完成（2026-07-21）；2026-09-24 起停止新功能，资产原地保留，开发主界面改 CLI-first（D119） |
| Studio Theia 迁移 | 🧊 历史快照（D119 冻结） | 2026-07-23 迁移态：10/11 扩展集成、Electron+browser 双端。后续演进：hmi-designer 已删（D117）、ld/fbd-glsp 已改 *-editor（D110）、Studio 整体冻结（D119）。theia-bridge 21/30 函数实现 |
| LD 编辑器 | 🧊 React Flow 完成（D110，D119 冻结） | 替换 GLSP，40×40 网格、触点/线圈、rung、E2E；图形编辑器随 D113/D119 挂起 |
| FBD 编辑器 | 🧊 React Flow 完成（D110，D119 冻结） | GLSP 已移除；vitest 26 |
| ST Monaco Editor | ✅ 完成 | Monaco Editor 文本编辑器，ST 结构化文本 |
| IL Monaco Editor | ✅ 完成 | Monaco Editor 文本编辑器，IL 指令表 |
| G-code Monaco Editor | ✅ 完成 | Monaco Editor 文本编辑器，G-code RS274 |
| SFC Editor | ✅ 完成 | SFC 顺序功能图编辑器 |
| Signal Browser | 🧊（D119 冻结） | Theia Widget；信号浏览改走 weftik monitor CLI / Grafana（D119 买不造） |
| Scope View | 🧊（D119 冻结） | Theia Widget；波形需求走 Grafana/MCAP 回放（D119） |
| Debug Panel (Theia) | 🧊（D119 冻结） | Theia 壳；DAP adapter 本体仍活跃（VS Code launch.json 接入，D119） |
| HMI Designer (Theia) | ⛔ 已移除（D117） | 2026-09 随 UI 移除链删除（曾于 2026-07 完成 Theia Widget 迁移） |
| Mode System | 🧊（D119 冻结） | 编辑器模式切换（6 语言；HMI 模式随 D117 删除失效） |
| 工程管理 (A1-A7) | ✅ 完成 | POU 树 + 变量表 + 类型 + 编译/部署/调试 + New Weftik Project 向导（D114 目录+project.yaml，无 workspace 从零创建 + 自动打开，D115） |
| RuntimeClient | ✅ 完成 | UDS IPC 客户端（7 方法含 deploy_hmi_layout + 认证）|
| Studio ↔ Controller 联调 | ✅ 完成 | deploy_program + load_hal_config + read_controller_signal |
| Modbus RTU/TCP | ✅ 完成 | libmodbus FFI，8 测试 |
| HART 适配器 | ✅ 完成 | 通道多 Signal 模式，6 测试 |
| DAP 调试适配器 | ✅ 完成 | 12 命令，断点/步进/寄存器/变量 |
| Studio 调试面板 | ✅ 完成 | 9 Tauri 调试命令 + DebugPanel 组件 |
| Prometheus Metrics | ✅ 完成 | /healthz + /metrics 端点，6 计数器 |
| JSON 日志 | ✅ 完成 | 结构化日志，按级别/模块过滤 |
| SimulationHarness | ✅ 完成 | 进程内测试工具架，场景录制/回放 |
| 故障注入引擎 | ✅ 完成 | Timeout/OutOfRange/Disconnect，5 测试 |
| VirtualModbusTcpDevice | ✅ 完成 | 8 FC 处理，寄存器↔信号映射，12 测试 |
| VirtualHARTDevice | ✅ 完成 | 通用命令 0-3 模拟，13 测试 |
| IEC 功能块 | ✅ 完成 | SR/RS/R_TRIG/F_TRIG，266 测试全通过 |
| 仿真 | 🟡 Inproc | InprocMiddleware 已是 MVP 仿真层，AVD Phase 3+ |
| Simulator (AVD) | 🔮 Phase 3/4 | 7 种虚拟设备，设计完成 |
| 工业调试桥 | 🔲 规划中 | architecture.md §5 设计完成 |
| CNC 系统 | 🟡 编译器+轴组完成 | G-code (75 测试含 G2/G3)、轴组 crate (32 测试)、运动规划器提取中、插补设计文档完成 |
| Studio 插件架构 | ⚠️ 已废弃（D71 Theia 替代） | D58/D59 被 D71 取代：插件模型→Theia Extension System，PlatformAdapter→Theia Browser 模式 |
| AUDEDeck | ⛔ 已移除（D117） | 2026-09 删除；Runtime IPC 契约保留，Panel 由外部项目维护 |
| HMI 设计器 | ⛔ 已移除（D117） | 2026-09 删除 theia-extensions/weftik-hmi-designer + packages/studio-core；布局验证职责移交外部项目 |
| HMI 部署契约 | ✅ 对外契约 | IPC 0x17→Config Barrier→外部 Panel；验收依据 openspec/specs/hmi-spec.md（13 项）|
| HMI 调试能力 | ⛔ 随设计器失效（D117） | SimHarness 本体保留；Preview 信号注入随设计器移除 |

## P0-P2 阶段完成状态

| 阶段 | 主要交付 | 日期 | 状态 |
|------|---------|------|:----:|
| P0 | CI (qa-fast 5门禁), Workspace 结构, 24 crates 骨架 | 2026-07-15 | ✅ |
| P1 | 5 IEC 61131-3 编译器 (ST/IL/LD/FBD/SFC), Runtime Engine, IPC Server | 2026-07-20 | ✅ |
| P1 | Theia 迁移 (D71), 6 语言编辑器, HMI Designer, GLSP 编辑器 | 2026-07-21 | ✅ → 🧊/⛔（Designer删D117・GLSP换D110・Studio冻结D119） |
| P1 | Modbus RTU/TCP, HART 适配器, SimHarness | 2026-07-19 | ✅ |
|| P2 | LD GLSP Editor (Sprotty SVG), FBD GLSP Editor — GLSP 2.7.0 集成完成 | 2026-07-31 | ✅ → ⛔（GLSP 已删 D110） |
| P2 | AUDEDeck 打包 (tauri bundle), SignalBridge push/poll, 9 Tauri 命令 | 2026-07-25 | ✅ → ⛔（AUDEDeck 删 D117，SignalBridge 为对外契约） |
| P2 | G-code 编译器 (75 测试), CNC 轴组 (32 测试), 插补设计 | 2026-07-19 | ✅ |
| P2 | Prometheus metrics, DAP 调试 (12 命令), JSON 日志 | 2026-07-20 | ✅ |
| P3 | AVD 仿真 (7 虚拟设备), amw-zenoh 网络传输 | 🔮 | 🔮 |
| P4 | NixOS 打包, OTA, IEC 62443 认证 | 🔮 | 🔮 |

## 文档与规范

| 类别 | 状态 | 备注 |
|------|:----:|------|
| HAL 设计文档 | ✅ 完成 | `docs/modules/hal/` 19 份子文档 |
| Runtime 设计文档 | ✅ 完成 | 6 份：IPC 安全+可观测+硬件+升级+Panel架构+审计日志 |
| CNC 设计文档 | ✅ 完成 | `docs/modules/cnc/` 5 份子文档 + SDD 规范 |
| Studio 设计文档 | 🟡 设计完成 | `docs/modules/studio/` 2 份设计文档（plugin-architecture-design + theia-architecture） |
| Panel 契约参考文档 | 📦 移交降参考（D117） | `docs/modules/runtime/panel-architecture-design.md` 保留为实现参考；Panel 实现属外部项目 |
| 竞品参考文档 | ✅ 完成 | `docs/reference/` 41 篇（12 大类） |
| SDD 规范 | ✅ 完成 | `openspec/specs/` 9 份规范，296 项（含历史参考章节，见各文件状态标注） |
| 架构文档 | ✅ 完成 | `docs/architecture.md` 2,110 行，七章 |
| 文档审计 | ✅ 完成 | 两次审计：50+32 项发现，77 项修复 |
| 实施规划 | ✅ 完成 | D31-D55 已记录，P0 团队审查通过 |
- **D67-D69** HMI 设计决策（sim_set_signal 复用、IPC 0x17 DEPLOY_HMI_LAYOUT、YAML Git 版本管理）
- **D70** Studio 响应式布局（`min-height:0` on `.app-panel`、html/body `background: var(--color-canvas)` 去白边）

## 技能库

| 技能 | 状态 | 用途 |
|------|:----:|------|
| design-system | 🧊 | Weftik 工业 UI 设计系统（D119 后仅适用薄扩展/外部 Panel 指引） |
| book-to-skill | ✅ | 文档→技能转换 |
| doc-audit | ✅ | 6 维度文档架构审计 |
| test-harness | ✅ | 多语言自动化测试工具架（6 模式） |
| skill-creator | ✅ | 从 HAL/SDD/FlatBuffers/Cargo 生成技能 |
| openspec-propose | ✅ | 结构化变更提案 |
| openspec-apply | ✅ | 变更实施（TDD + 7 门禁） |
| openspec-verify | ✅ | 交叉层规范验证 |
| openspec-explore | ✅ | 4 源知识探索 |
| openspec-archive | ✅ | 变更归档 |
| openspec-sync-specs | ✅ | 增量规范同步 |
| ref-codesys/ref-beckhoff/ref-qtouch | ✅ | Studio 参考技能（7 项） |
| think-before-act | ✅ | 先调研→列方案→审批→执行，防蛮干（不限语言/框架） |
| ecosystem-scan | ✅ | 双层审计（Quick/Full）+ 生态扫描 + 安全门禁 |
| skill-guide | ✅ | 常驻技能选择指南（决策树 + 场景组合） |
| skill-router | ✅ | 主动技能路由分析（任务分类→技能匹配） |

## 架构演进 (2026-07-24)

- **架构重新设计完成** — `robotics-architecture-design.md（内部存档未公开，可执行旨见 decisions.md D77-D91）` (1864 行, 48 章节)，覆盖统一自动化平台全栈架构
- **命名体系重定义**:
  - Supervisor → **Agent** (车端管理代理)
  - Controller → **Runtime** (实时运行时)
  - Field + Cloud → **Hub** (统一插件化平台)
- **新增 crates 规划**: `weftik-agent` (从 Supervisor 改名), `weftik-hub` (新仓库)
- **Studio 双形态**: Desktop (CODESYS IDE 模式) + Web (Hub 插件模式)
- **新增功能设计**: 配方管理(ISA-18.2)、告警管理、审计追踪(21 CFR 11)、控制器冗余(Hot Standby)、时间同步(PTP)、数字孪生
- **15 项新架构决策**: D77-D91 已记录于 decisions.md

## M1 里程碑 (3D 打印机控制器)

- **目标**: 以光固化打印机验证 IEC 61131-3 + 硬件 IO 全链路 headless（D119 修订：操作端 = 外部 Panel / 标准协议客户端，Studio UI 零参与）
- **子任务**: Agent+Runtime 联调 → ST 端到端 → FBD 端到端 → SFC+G-code → 硬件 IO → 收尾（原"HMI 设计"项已随 D119 移除）
- **计划**: 7-8 周, `.sisyphus/plans/m1-3d-printer-platform/`


## Studio 双端测试状态 (2026-07-27) — 已废弃（被 2026-07-28 修复取代）

见下方 2026-07-28 章节

**Socket.IO 修复**: 捆绑 main.js 中的 engine.io allowRequest 处理器已损坏（调试残留导致所有请求返回 403）。node_modules 源码正确，仅捆绑版本受影响。已应用修复。详见 pitfalls.md。

## Studio 双端构建修复 (2026-07-27) — 已废弃（被 2026-07-28 修复取代）

见下方 2026-07-28 章节
## Studio 双端构建修复 (2026-07-28)

- **esbuild 构建修复**: 删除所有扩展 node_modules → Symbol 去重 → LD/FBD 图标正常
- **浏览器菜单修复**: theia.target 改为 browser → browser-menu-module 加载 → 原生 Web 菜单可点击
- **React hooks 修复**: 所有扩展 React 导入改为 @theia/core/shared/react, 0 errors
- **@weftik/theia-bridge**: 添加到 studio dependencies（扩展不再自带）
- **LD palette onStart 移除**: 防止重复创建 widget
- **PC+Web 共存**: theia.target=browser, 一次构建 → 三目标 (browser/node/electron), 双端功能对齐
- **think-before-act 技能**: 新增元约束技能，先调研→列方案→审批→执行

### 双端测试状态 (2026-07-28)

| 测试类别 | 状态 | 详情 |
|----------|:----:|------|
| Rust 编译器 (ld/il/agent) | ✅ | 38+ tests pass, 0 fail |
| Runtime Pipeline | ✅ | 7/7 pass (0.26s) |
| E2E Smoke (S1-S6) | ✅ | 6/6 pass (24.9s) |
| Vitest (hmi-designer) | ⚠️ | 14/14 pass signal-validation, 3 suites fail (react module) |
| 浏览器访问 | ✅ | IDE 渲染正常, 菜单栏可点击, LD/FBD 图标正常, 0 Socket.IO 错误 |
| Electron 应用 | ✅ | 窗口启动正常, 双端功能对齐, Web 渲染菜单替代原生 |
| npm run build | ✅ | 0 errors, 3 targets (browser/node/electron) |

### 诊断清单

```bash
# Symbol 唯一性（必须 = 1）
grep -c 'Symbol("FrontendApplicationContribution")' lib/frontend/bundle.js

# React 导入检查（必须为空）
grep -rn 'from "react"' theia-extensions/*/src packages/*/src --include="*.ts" --include="*.tsx" | grep -v "@theia/core/shared/react"

# 扩展本地 node_modules 检查（必须为空）
find theia-extensions -path "*/node_modules/@theia*" 2>/dev/null

# 启动命令
# Web:  node lib/backend/main.js --port=3100
# PC:   npx electron lib/backend/electron-main.js
```

## Ecosystem Scan (2026-07-29)

### P0 完成
- D97 重复合并 → decisions.md 1 个 D97
- openspec-apply-change 删除（被 openspec-apply 取代）
- openspec-archive-change 删除（被 openspec-archive 取代）

### P1 内部完成
- testing.md: +5 条可执行命令
- security.md: +1 条可执行命令

### P1 外部
- testmu-ai/playwright-skill: GitHub 0 结果，仓库不存在
- testmu-ai/vitest-skill: GitHub 0 结果，仓库不存在
- trailofbits/security-skills: GitHub 0 结果，仓库不存在
- 已有覆盖: Playwright MCP + vitest 实际使用 + security.md 规则

### 技能数
- 删除: 2 (openspec-apply-change, openspec-archive-change)
- 新增: 4 (ecosystem-scan, lesson-review, skill-guide, skill-router)
- 净变化: +2（23 → 25）

### Agent 模型分层优化 (2026-07-29)
- prometheus: premium → premium-max（计划生成错误代价最大）
- metis: premium → fast（度量分析是 pattern matching）
- oracle/prometheus: +reasoningEffort: "high"
- ultrabrain: +reasoningEffort: "high"
- unspecified-high: +reasoningEffort: "medium"
- explore: temperature 0.0 → 0.1
- timeout_seconds: 30 → 60
### Agent 模型上下文核实 (2026-09-23) — 修正 2026-07-29 分层的隐含假设
- `~/.config/opencode/opencode.json` → `provider.new-api.models.premium.limit.context = **1024000**`；**premium-max 同为 1M** ⇒ 两者均 1M，**无需修订**（14 个别名已全部声明 1M；`fast-1`/`vision-1`/`lite` 等短上下文除外）
- 网关实测：`premium` 接 `prompt_tokens=190,061` 与 `400,061` 均 **HTTP 200** ⇒ 上游 **≥400K**。会话报的 `slot is 200000` 来源 = **OpenCode 对自定义 provider 的回退默认值**（插件/缓存/项目配置均已实测排除）
- ⚠️ **结论**：改 `limit.context` **不影响实际可用窗口**。要放开 200K 闸门必须动插件层，或绕开 category 路由直接 `/models` 选模型跑裸会话
- 待办：OpenCode 侧该回退值能否用 `provider.*.models.*.limit` 之外的方式覆盖，未验证


### 技能 frontmatter 修复
- 9 个技能添加 name + description: lesson-review, think-before-act, ref-beckhoff, ref-codesys, ref-fuxa, ref-ignition, ref-intouch, ref-labview, ref-qtouch

### OMSPBase 对比扫描
- 配置已同步: prometheus/metis/reasoningEffort/timeout
- 无需额外添加: teams 配置、platform.md

### LD/FBD 工具面板修复 (2026-07-29)
- 根因: `initializeLayout()` 仅在首次启动时调用，后续启动恢复保存的布局
- 修复: 添加 `onDidInitializeLayout()` + 防重复守卫（Theia 官方推荐模式）
- 发现: lib/ 编译产物过期导致修复在源码中存在但编译后不生效
- 教训: 修改源码后必须验证 lib/ 编译产物（已添加 edit-safety Rule 13）

## Theia 参考文档 + GLSP 调试 (2026-07-30)

### GLSP 编辑器验证 (ld-glsp-verify-editor)
- **状态**: 9/15 任务完成，图表渲染阻塞
- **修复**: loadSourceModel 文件读取 ✅、StatusAction handler ✅、边缘 type 默认值 ✅、Socket.IO 403 ✅
- **阻塞**: sprotty vs @eclipse-glsp/sprotty DI Symbol 不匹配导致 ViewRegistry 找不到 graph view
- **方案**: 混合导入 — views 从 @eclipse-glsp/sprotty，features 从 sprotty（D99）

### 参考文档库扩展
- 新增: `docs/reference/glsp.md` (770行) — Eclipse GLSP 产品画像 + node-json-theia 模板深度分析
- 新增: `docs/reference/theia-architecture.md` (441行) — Eclipse Theia 架构深入分析（DI、扩展、Widget、生命周期）
- 新增: `docs/reference/theia.md` (310行) — Eclipse Theia 产品画像
- 新增: `docs/reference/neuron-smart-engineer.md` (216行) — Neuron Smart Engineer 分析
- 新增: `docs/reference/theia-projects.md` (104行) — Theia 工业生态对比
- 修正: Neuron Smart Engineer 使用 VS Code 扩展架构（非 Theia）— D100

### 技能库更新
- pitfalls.md: 追加 GLSP 调试章节 (7条) — stdout 消费、StatusAction handler、进程 kill、边缘 type、CJS 导出、并行 edit
- edit-safety.md: 追加 Rule 14-18
- decisions.md: 追加 D99 (GLSP 模块隔离), D100 (Neuron 技术栈修正)

### 清理
- .sisyphus/ 过时文件已清理（审计、旧计划、旧 spec、旧 teams）
- 保留活跃文件: ld-glsp-verify-editor.md, ld-glsp-cleanup.md, dual-mode-test-report.md

## LD GLSP 编辑器修复 (2026-07-30)

### 根因与修复
- **Symbol 重复**: 扩展 node_modules symlink 导致所有 @theia/core Symbol 在 bundle 中重复 (=2)，全部 DI 注入静默失败
- **修复**: 构建时移除 symlink，构建后恢复（服务器需要）。Symbol 去重后 `[LD Opener]` bootstrapping/constructed/registered 全部出现
- **OpenHandler 注册**: 使用 `FrontendApplicationContribution.onStart()` + `OpenerService.addHandler()` 手动注册，绕过 inversify 6.2.2 + Theia 1.73 环境下 `toService()` 不被 `ContributionProvider` 收集的问题
- **编辑功能**: 还原 `execute()` 模式（`createCommand()` 返回 undefined），GLSP 框架自动触发 GModel 重新生成

### 提交
- `dd3146d` revert to execute() pattern
- `b269fbc` bypass Symbol duplication via manual OpenHandler + bootstrap
- `c79a6b9` bind OpenHandler in plain ContainerModule
- `4e1bdd0` use commandOf() pattern (已回退)
- `8067d8d` configureDefaultModelElements + import unify + ComputedBoundsActionHandler

### 新增决策
- D103: 构建时移除扩展 node_modules symlink
- D104: LD GLSP OpenHandler 注册策略 — OpenerService.addHandler()

### 记忆更新
- pitfalls.md: 新增 5 条（Symbol 重复、toService 不兼容、缓存问题、服务器 node_modules、commandOf 失败）
- edit-safety.md: 新增 Rule 19 — 构建后 Symbol 唯一性检查
- conventions.md: 新增 GLSP 构建两步法


## Ecosystem Scan (2026-09-24 Full)

- **本地**：14 原始→10 真发现全修（AGENTS 元数据 44→21/89→17/技能构成；rules ../common 断链；skill-router 路由行；ignore 台账实测校正 **G1 7 + ST→IR 18 + 无关 ipc flaky 1**；scripts/qa/qa-fast.sh 死路径×5；conventions 编辑约束收敛 edit-safety 单源；pitfalls 孤儿归位+五段式补齐+3 旧待办关闭；decisions 死路径 D67/D68/D70/D72/D36 + D95 引用漂移）；代理误报剔 4（vitest 160 实为正确、rules 链接非×5、st-compiler 引用系刻意记录等）
- **引入技能（vendored，LICENSE+出处+安全扫描结论已入各 SKILL.md 头部）**：`rust-testing` + `rust-patterns`（ECC@bf70150 MIT，纯方法论零可执行面）、`archify`@9e35d2b（MIT，4.4MB 含本地渲染器，examples/ 已排除；首次运行前目视 bin 命令）；技能数 22→25
- **缓/拒**：sickn33 vscode-extension-guide 缓（聚合镜像供应链弱，人工审查后再入）；anthropics/skills 主体、cargo 包装类 MCP、无 LICENSE 项拒
- **superpowers 同步**：`diagnosing-superpowers` 等上游新增随 oh-my-openagent 包更新自动到位，无手动动作
- **MCP 里程碑伴生登记**（详见 conventions 硬件 MCP 安全约定）：mcp-grafana→D119§4；modbus-connector-mcp→§5④；OPC 基金会 UA MCP→M2；virtme-ng→§5③(需 Linux 主机)；P2：probe-rs embedded-debugger / zenoh-plugin-mcp(2★，引入需先审后 fork) / mcp-serial / 示波器类
- **生态真空确认**：MQTT/Grafana-dC/DAP/FlatBuffers/IEC-61131 无任何成熟 skill——自研方向获外部印证，产出可反哺生态
- **验证命令**：`grep -rn 'scripts/qa/qa-fast.sh|](\.\./common/|weftik-ipc-server|p0-milestone' .agents/ AGENTS.md SKILL.md` 应为 0 命中