# IEC 61131-3 工程组织模型（Cargo 模型 for IEC）

**日期**: 2026-08-07 | **决策**: [D114](.agents/memorys/decisions.md) | **计划**: `.sisyphus/plans/text-first-iec-editor/plan.md`（A1-A4 工程底座）

> 本文档描述 **源码级工程组织**（工程在磁盘上如何布局、清单如何表达工程身份）。
> 与 `project-organization-design.md`（Device/Cell/Factory **部署拓扑**模型）是不同关注点，两者互补：本文档的工程是部署拓扑中一个节点的构建单元。

## 概述

Weftik 工程采用 **Cargo 模型 for IEC 61131-3**：**文件夹即工程** + **薄清单文件**（`project.yaml`）+ **一 POU 一文本文件**。四层关注点解耦（逻辑 / IO / 任务 / 硬件），所有内容为纯文本，Git 合规且对 AI agent 可见。

**否决的替代方案**（D114）：
- 纯目录约定（无法表达目标 Runtime / 任务 / IO / 库版本锁）
- 单体工程文件 `.project` / `.acd`（CODESYS/TIA/Studio5000 用 20 年证明的 Git 灾难，全行业逃离）

## 目录结构

工作区根目录**即**工程根目录（Theia "Open Folder" 模式）。空工程标准文件集：

```
<project-root>/
├── project.yaml          # 清单：工程身份 + 路径映射（唯一真相源，不含代码）
├── Programs/             # PROGRAM POU
│   └── Main.st
├── FBs/                  # 功能块 POU
│   └── README.md
├── Functions/            # 函数 POU
│   └── README.md
└── GVL/                  # 全局变量表
    └── Globals.gvl
```

分层演进（D113 A1）：
- `Programs/` / `FBs/` / `Functions/` / `GVL/` — 当前已实现
- `types/` / `config/` / `tasks/` — 后续按需叠加（更细的四层解耦）

## 清单文件 `project.yaml`

薄清单，只表达工程身份与路径映射，**不含代码**。代码是独立文本文件、不含构建配置。

```yaml
name: my-project
version: "1.0"
weftik_version: "0.1.0"
target:
  runtime: weftik-rt
paths:
  programs: Programs/
  function_blocks: FBs/
  functions: Functions/
  global_variables: GVL/
```

- `name` — 合法 IEC 标识符（`/^[A-Za-z_][A-Za-z0-9_]*$/`），消费端校验
- `version` — 语义版本
- `target.runtime` — 目标 Runtime 标识（单目标部署，D113 定案⑥；多目标后置）
- `paths.*` — 语言组织的目录映射

**锁文件**（`iecproj.lock`，规划中）：锁定依赖版本，保证可复现构建。

## 四层解耦

| 层 | 载体 | 关注点 |
|----|------|--------|
| 逻辑代码 | `Programs/` `FBs/` `Functions/` `GVL/` 文本 | 控制逻辑（ST 为主，D113 定案⑧）|
| IO 映射 | 规划中（`config/`） | 信号 ↔ 物理 IO |
| 任务调度 | 规划中（`tasks/`） | 周期 / 优先级 / 触发 |
| 硬件配置 | 规划中（`config/`） | 目标 Runtime / 设备 |

解耦价值：硬件无关编辑、数字孪生 / 仿真复用同一逻辑工程、多目标部署。

## 图形语言（LD/FBD/SFC）

用 **PLCopen XML** 或干净 JSON/YAML 存储，**绝不用厂商二进制**。编译器管线 D108 已支持图形语言 → IL → HalProgram，后补不阻塞文本闭环（D113）。

## 实现（2026-08-07）

- `project-model.ts` — 纯模型，零 @theia 依赖（可单测）：`projectYaml()` / `projectTemplateFiles()` / `parseProjectYaml()` / `validateProjectName()`
- `project-wizard-contribution.ts` — "New IEC Project…" 向导（File ▸ IEC 61131-3），创建标准文件集，**绝不覆盖已存在文件**
- A1-1 目录约定（Git 提交 2ec6339）、A1-2 POU 树、A1-4 新建 POU 向导（提交 15c6e8d）已就绪

## 交叉引用

- 决策：D113（文本优先 IEC 编辑器）、D114（Cargo 模型 for IEC）
- 计划：`.sisyphus/plans/text-first-iec-editor/plan.md` §A1-A4
- 部署拓扑：`docs/modules/studio/project-organization-design.md`（Device/Cell/Factory）
- 类型系统：`docs/modules/hal/iec-type-system-design.md`（D12）