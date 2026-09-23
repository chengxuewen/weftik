# HMI 契约规范（Runtime 侧通道）

> **来源**: `docs/modules/runtime/panel-architecture-design.md` + D62-D69
> **总项数**: 13 (部署管道 7 + SignalBridge 6)
> **传输格式**: YAML (开发期) / FlatBuffers (运行时, D24)
> **相关决策**: D62, D63, D64, D68, D69, D117

> **⚠️ 范围声明（D117, 2026-09-23）**: Studio 侧 HMI 设计器与布局验证器（原 HMI-VAL-001~009）已移除——
> 布局验证职责移交外部 Panel/UI 项目。本文件仅规范 **Runtime 对外契约**：
> IPC 0x16/0x17/0x18、Config Barrier 布局应用、信号推送语义。Panel 端实现（SignalBridge/Transport）
> 由外部项目维护，此处条款作为其对接验收依据。

---

## 1. HMI 部署管道 (HMI-DPL)

### HMI-DPL-001: DEPLOY_HMI_LAYOUT 消息格式

IPC method `0x17` 携带序列化的 HmiLayout。请求结构同 `0x10`（deploy_program）：`<header(8B)> + <hmac(32B)> + <payload>`。payload 为 YAML 字符串（Phase 1）或 FlatBuffers 二进制（Phase 2）。

- **前置条件**: 客户端调用 `controller_client.deploy_hmi_layout(yaml_content)`
- **操作**: Controller 接收 0x17 帧
- **期望**: 解析成功，payload 提取为 `String`
- **边界**: payload 最大 1MB（超过拒绝并返回错误）
- **测试**: `test_deploy_hmi_layout_message_format`

### HMI-DPL-002: HMAC 认证

`0x17` 必须携带有效的 HMAC token，角色必须为 `Role::Engineer`（值 1）。

- **前置条件**: 使用过期 token 或 `Role::Operator` 发送 0x17
- **操作**: IPC Server 验证 HMAC + RBAC
- **期望**: 返回 `ErrorCode::AuthFailed`（401）或 `ErrorCode::Forbidden`（403）
- **边界**: 空 HMAC token → AuthFailed；HMI 角色 layout 部署 → Forbidden（仅 Engineer 可部署布局）
- **测试**: `test_deploy_hmi_layout_auth_rejected`

### HMI-DPL-003: Config Barrier 周期边界应用

HmiLayout 在 RT 周期边界批量生效（D17），当前周期内写入的内容在本周期不可见。

- **前置条件**: 调用 `deploy_hmi_layout` 后立即 `read_current_layout`
- **操作**: 在周期 N 中调用 deploy → 在周期 N 中立即 read
- **期望**: `read_current_layout` 返回旧布局（新布局尚未生效）
- **期望**: 周期 N+1 开始时新布局生效
- **边界**: 同周期多次 deploy → 仅最后一次生效
- **测试**: `test_config_barrier_hmi_layout_defer`

### HMI-DPL-004: 部署确认

Controller 在布局应用成功后发送 `DEPLOY_ACK(0x17, status=0, generation=N)`。

- **前置条件**: 布局部署成功
- **操作**: Controller 在周期边界应用新布局
- **期望**: 客户端接收 `DEPLOY_ACK` 帧，`generation` 递增
- **期望**: `generation` 从 1 开始单调递增（与 D68 一致）
- **边界**: 部署失败 → `DEPLOY_ACK` 带 `status=1`（错误码）
- **测试**: `test_deploy_hmi_layout_acknowledgment`

### HMI-DPL-005: Panel 获取新布局〔外部项目实现〕

Panel 收到 `DEPLOY_ACK` 后通过 SignalBridge 重新加载布局（D68）。

- **前置条件**: Controller 部署新布局并发送 ACK
- **操作**: Panel 的 `SignalBridge` 接收到 `onLayoutChange(generation)` 回调
- **期望**: Panel 调用 `snapshot()` 刷新所有绑定的信号值
- **期望**: Panel 渲染新布局（旧 widget 隐藏、新 widget 显示）
- **边界**: Panel 与 Controller 断开重连 → Panel 启动时请求当前 generation（0x18 GET_HMI_LAYOUT）
- **测试**: 集成测试（外部 Panel 项目负责）

### HMI-DPL-006: 布局 YAML 持久化

部署成功后将布局写入 Controller 本地文件系统 `{project}/hmi/layout.yaml`（D69）。

- **前置条件**: 布局部署成功（`DEPLOY_ACK` status=0）
- **操作**: Controller 将 YAML 内容写入磁盘
- **期望**: 文件存在且内容与客户端发送的一致
- **期望**: 文件通过 Git 纳入版本管理（`{project}/` 目录已在 Git 中）
- **边界**: 磁盘满 → 部署失败，DEPLOY_ACK 带 status=2（磁盘错误）
- **测试**: `test_hmi_layout_persistence_to_disk`（使用 tempdir）

### HMI-DPL-007: 启动加载持久化布局

Controller 启动时从 `{project}/hmi/layout.yaml` 加载上次部署的布局。

- **前置条件**: 上次部署后 Controller 重启
- **操作**: Controller 读取 `{project}/hmi/layout.yaml`
- **期望**: 加载成功，Panel 可立即显示持久化的布局
- **边界**: 文件不存在 → 返回默认空布局（无错误）
- **边界**: YAML 解析失败 → 返回错误，不应用损坏的布局
- **测试**: `test_load_hmi_layout_on_startup`

---

## 2. SignalBridge (HMI-SIG)

### HMI-SIG-001: Hybrid 模式推送优先

默认启用 push 优先级（Controller 端 SIGNAL_PUSH frame）。仅当 `push_available=false` 时降级为 poll 模式。

- **前置条件**: Controller 支持 0x16 push（UDS 或 WebSocket 连接）
- **操作**: SignalBridge 建立连接时检测 push 可用性
- **期望**: `mode` 字段 = `"push"`，`push_available` = true
- **期望**: UDS 连接 push 延迟 <50μs（D62）
- **期望**: push 不可用时（Controller 不支持、网络受限）→ `mode` = `"poll"`，`poll_interval_ms` = 100（D62）
- **测试**: `test_signalbridge_push_priority`

### HMI-SIG-002: 周期边界批量推送

Controller 端信号推送在 RT 周期边界（Config Barrier 边界）批量发送（D63）。

- **前置条件**: 同一周期内 `axis.0.pos` 被写入 3 次（值 1.0 → 2.0 → 3.0）
- **操作**: RT 周期结束时批量推送
- **期望**: Panel 仅收到一次推送，值为最终值 3.0
- **期望**: Panel 不会在推送间隙看到中间值（1.0 → 2.0 仅在 RT 线程内可见）
- **测试**: `test_batch_push_at_cycle_boundary`

### HMI-SIG-003: writeSignal 权限检查

Role::HMI（枚举值 5）仅限于 HmiLayout 中 button widget 绑定的信号执行写入（D64）。

- **前置条件**: Panel 以 Role::HMI 连接，尝试写入 `"axis.0.pos"`（非 button 信号）
- **操作**: SignalBridge 调用 `writeSignal("axis.0.pos", 50.0)`
- **期望**: Controller 拒绝写入，返回 `Forbidden`
- **期望**: 尝试写入 button 绑定的信号 `"pump.1.start"` → 成功
- **边界**: Role::Engineer 可写入任意信号（不受 button 绑定限制）
- **测试**: `test_hmi_write_signal_permission`

### HMI-SIG-004: Deadband 写入过滤

F64 信号值变化 < Deadband 阈值时不推送（避免网络洪水）。默认 deadband: F64 = 0.1%, F32 = 0.5%, 整数 = 0。

- **前置条件**: 信号 `"tank.level"` 当前值 50.000，下周期变为 50.001（变化 0.002%）
- **操作**: 周期边界推送时检查 deadband
- **期望**: 值 50.001 不被推送（变化 < 0.1% deadband）
- **边界**: 变化 ≥ deadband 阈值时正常推送
- **边界**: 布尔值始终推送（无 deadband）
- **测试**: `test_deadband_filter_filters_small_changes`

### HMI-SIG-005: 信号订阅生命周期〔外部项目实现〕

Panel 通过 `subscribe(signalNames: string[])` 注册订阅，`unsubscribe(signalNames)` 取消。Controller 仅向已订阅 Panel 推送。

- **前置条件**: Panel 订阅 `["axis.0.pos", "tank.level"]`
- **操作**: 周期边界，`axis.0.pos` 变更
- **期望**: Panel 收到 `axis.0.pos` 推送，`tank.level` 不变时不推送
- **操作**: Panel 调用 `unsubscribe(["axis.0.pos"])`
- **期望**: 后续周期 `axis.0.pos` 变更不再推送到该 Panel
- **边界**: Panel 断开连接 → 自动取消所有订阅
- **测试**: `test_signal_subscription_lifecycle`

### HMI-SIG-006: IPanelTransport 接口〔外部项目实现〕

所有 Panel 传输实现遵循统一接口。本仓库侧唯一实现为 `RuntimeClient`（Rust，UDS，D66）。

```typescript
interface IPanelTransport {
  connect(): Promise<void>;
  readSignal(name: string): Promise<HalValue | null>;
  writeSignal(name: string, value: HalValue): Promise<void>;
  snapshot(): Promise<Record<string, HalValue>>;
  subscribe(names: string[], onPush: SignalPushCallback): Promise<void>;
  unsubscribe(names: string[]): Promise<void>;
}
```

- **前置条件**: 外部 Panel 实现 `IPanelTransport`（如 `UdsTransport`）
- **操作**: 调用 `transport.connect()` 后调用 `transport.snapshot()`
- **期望**: 返回所有已发布信号的当前值快照
- **边界**: 未连接时调用 → 抛出 `TransportError("not connected")`
- **测试**: 集成测试（外部 Panel 项目负责）

---

## 交叉引用

| 决策 | 规范项 |
|------|--------|
| D62 | HMI-SIG-001（Hybrid push/poll）, HMI-SIG-002（周期边界批量） |
| D63 | HMI-SIG-002（周期边界批量推送） |
| D64 | HMI-SIG-003（writeSignal 权限） |
| D66 | HMI-SIG-006（IPanelTransport） |
| D68 | HMI-DPL-001~007（0x17 DEPLOY_HMI_LAYOUT 全流程） |
| D69 | HMI-DPL-006~007（YAML 持久化） |
| D117 | 本文件范围声明（HMI-VAL 移交外部项目） |

## Phase 边界

- **本仓库实现**: HMI-DPL-001~004,006,007（部署核心），HMI-SIG-001~004（推送核心）
- **外部 Panel 项目实现**: HMI-DPL-005、HMI-SIG-005~006、原 HMI-VAL 全部
- **P2 候选**: deadband 可配置化、订阅模式服务化
