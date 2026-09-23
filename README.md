# Weftik

Weftik 是面向工业自动化与机器人的统一开发与运行时框架 —— 同一份 IEC 61131-3 /
G-code 程序，在仿真器与真实控制器上确定性一致地运行。
*One program. Simulator and steel.*

组件：Studio IDE（Eclipse Theia + Monaco + React Flow）、Runtime Engine、
Hardware Abstraction Layer (HAL)、Simulator、CNC 控制。Panel/HMI UI 由外部项目
基于 Runtime IPC 契约（0x16/0x17/0x18）实现。

## Status

Theia migration complete (2026-07-21). 24 Rust crates, 6 IEC 61131-3 compilers
(ST/IL/LD/FBD/SFC), G-code compiler, Runtime Engine (5-step cycle + hot-swap),
Supervisor, IPC Server, Modbus/HART protocol adapters, Eclipse Theia Studio IDE
(Monaco Editor + GLSP + napi-rs bridge, 6 language editors + HMI designer),
SimulationHarness, Prometheus metrics, DAP debug adapter.
799+ `#[test]` annotations. 239 SDD specification items.

Active development: CNC axis group + interpolation, amw-zenoh network transport,
HMI push-mode SignalBridge.