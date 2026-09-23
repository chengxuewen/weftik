#!/usr/bin/env python3
"""weftik — Weftik 统一构建 CLI（单入口）。

薄壳（weftik.sh/.bat）保证 pixi 环境激活后调用本脚本；
环境内 PATH 已注入，subprocess 直接调 cargo 等。
平台差异仅 clean（rmdir vs rmtree）与 run（pkill Unix-only）两处。

用法: weftik [-h] {build,test,qa,run,deploy,clean,config,status,version} ...
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

VERSION = "0.1.0"
ROOT = Path(__file__).resolve().parent.parent
QA_LEVELS = {"fast", "full", "deep"}


def _check(tool: str, hint: str) -> None:
    """依赖检查 — 缺失时明确报错退出（不静默）。"""
    if shutil.which(tool) is None:
        print(f"错误: 缺少依赖 '{tool}' — {hint}", file=sys.stderr)
        sys.exit(1)


def _run(cmd: list[str], env: dict[str, str] | None = None) -> int:
    """执行命令（默认继承环境），失败透传退出码。"""
    print(f"$ {' '.join(cmd)}")
    return subprocess.run(cmd, env=env).returncode


def _run_or_exit(cmd: list[str], env: dict[str, str] | None = None) -> None:
    code = _run(cmd, env=env)
    if code != 0:
        sys.exit(code)


# ── build / test / qa ─────────────────────────────────────────────

def _cmd_build() -> None:
    _check("cargo", "pixi 环境未激活? 先运行: source bootstrap.sh / pixi.sh")
    _run_or_exit(["cargo", "build", "--workspace"])


def _cmd_test() -> None:
    _check("cargo", "pixi 环境未激活?")
    _run_or_exit(["cargo", "test", "--workspace"])


def _cmd_qa(level: str) -> None:
    script = ROOT / "scripts" / f"qa-{level}.sh"
    if not script.exists():
        print(f"错误: 无 QA 脚本 {script}", file=sys.stderr)
        sys.exit(1)
    _run_or_exit(["bash", str(script)])


# ── clean ─────────────────────────────────────────────────────────

def _rm_tree(path: Path) -> None:
    """跨平台目录删除（Windows rmdir / Unix rmtree）。"""
    if not path.exists():
        return
    try:
        if sys.platform == "win32":
            _run_or_exit(["rmdir", "/s", "/q", str(path)])
        else:
            shutil.rmtree(path)
        print(f"已删除: {path}")
    except PermissionError:
        print(f"警告: 无法删除 {path}（可能含权限受限文件）— 手动执行: rm -rf {path}", file=sys.stderr)


def _cmd_clean() -> None:
    _rm_tree(ROOT / "target")
    cargo_target = os.environ.get("CARGO_TARGET_DIR")
    if cargo_target:
        print(f"注意: CARGO_TARGET_DIR={cargo_target}（可能被多项目共享）")
        _rm_tree(Path(cargo_target))


# ── run ───────────────────────────────────────────────────────────

def _find_runtime_binary() -> Path | None:
    """找 runtime 二进制（CARGO_TARGET_DIR → target/debug → target/release）。"""
    cargo_target = os.environ.get("CARGO_TARGET_DIR")
    candidates: list[Path] = []
    if cargo_target:
        candidates.append(Path(cargo_target) / "debug/weftik-runtime")
    candidates += [
        ROOT / "target/debug/weftik-runtime",
        ROOT / "target/release/weftik-runtime",
    ]
    return next((p for p in candidates if p.exists()), None)


def _cmd_run(foreground: bool) -> None:
    # run 用 pkill 清旧进程 — pkill 是 Unix-only（审查 C2/H4）
    if sys.platform == "win32":
        print("run: Windows 暂不支持（pkill 依赖 Unix）", file=sys.stderr)
        sys.exit(1)
    bin_path = _find_runtime_binary()
    if bin_path is None:
        print("错误: 未找到 weftik-runtime 二进制 — 先运行: weftik build", file=sys.stderr)
        sys.exit(1)
    subprocess.run(["pkill", "-x", "weftik-runtime"], check=False)  # no-op if none
    env = {**os.environ, "RUST_LOG": "info"}

    if foreground:
        proc = subprocess.Popen([str(bin_path)], cwd=ROOT, env=env)
        try:
            proc.wait()
        except KeyboardInterrupt:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
            sys.exit(130)
        sys.exit(proc.returncode)

    log_path = Path("/tmp/weftik-runtime.log")
    proc = subprocess.Popen(
        [str(bin_path)],
        cwd=ROOT,
        env=env,
        stdout=open(log_path, "wb"),
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    print(f"✓ weftik-runtime 已启动 (PID {proc.pid}) — 日志: {log_path}")


# ── config ────────────────────────────────────────────────────────

def _cmd_config(action: str) -> None:
    if action == "show":
        for path in (ROOT / "project.yaml",):
            print(f"--- {path.name} ---")
            if path.exists():
                print(path.read_text(encoding="utf-8"))
            else:
                print(f"(缺失: {path})", file=sys.stderr)
        return
    try:
        import yaml  # noqa: PLC0415
    except ImportError:
        print("错误: 缺少 pyyaml — 运行: pixi install", file=sys.stderr)
        sys.exit(1)
    path = ROOT / "project.yaml"
    if not path.exists():
        print(f"缺失: {path}", file=sys.stderr)
        sys.exit(1)
    try:
        yaml.safe_load(path.read_text(encoding="utf-8"))
        print(f"OK: {path}")
    except yaml.YAMLError as e:
        print(f"YAML 错误: {path}: {e}", file=sys.stderr)
        sys.exit(1)


# ── status / version / deploy ─────────────────────────────────────

def _cmd_status() -> None:
    pixi_bin = shutil.which("pixi") or str(Path.home() / ".pixi/bin/pixi")
    tools = [
        ("pixi", [pixi_bin, "--version"]),
        ("cargo", ["cargo", "--version"]),
        ("rustc", ["rustc", "--version"]),
        ("docker", ["docker", "--version"]),
        ("node", ["node", "--version"]),
    ]
    for name, cmd in tools:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10, check=False)
        except (OSError, subprocess.TimeoutExpired):
            print(f"{name:8s} MISSING（或超时）")
            continue
        output = (result.stdout or result.stderr).strip().splitlines()
        print(f"{name:8s} {output[0] if output else '?'}")


def _cmd_version() -> None:
    print(VERSION)


def _cmd_deploy() -> None:
    print("deploy: 待 RuntimeClient 就绪，本期占位。", file=sys.stderr)
    sys.exit(1)


# ── dispatch ──────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="weftik",
        description="Weftik 统一构建 CLI（单入口: build/test/qa/run/deploy/clean/config/status/version）",
        epilog="常用参数:  run [-f] 前台实时输出日志 | qa <fast|full|deep> | config <show|validate>\n各子命令详细参数见: weftik <cmd> -h",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("build", help="构建 workspace (cargo build --workspace)")
    sub.add_parser("test", help="运行 workspace 测试（快速反馈；完整门禁用 qa fast）")
    qa_p = sub.add_parser("qa", help="QA 门禁 <level>: fast|full|deep（默认 fast）")
    qa_p.add_argument("level", nargs="?", choices=sorted(QA_LEVELS), default="fast")
    run_p = sub.add_parser("run", help="启动 weftik-runtime [-f 前台实时日志]（macOS/Linux）")
    run_p.add_argument("target", nargs="?", choices=["runtime"], default="runtime", help="启动目标（当前仅 runtime，D81 多进程预留）")
    run_p.add_argument("--foreground", "-f", action="store_true", help="前台运行，输出实时透传（开发调试）")
    sub.add_parser("deploy", help="部署工程到 Runtime（待 RuntimeClient 就绪，本期占位）")
    sub.add_parser("clean", help="清理构建产物（target）")
    config_p = sub.add_parser("config", help="配置 <show|validate>")
    config_p.add_argument("config_cmd", choices=["show", "validate"])
    sub.add_parser("status", help="环境诊断（pixi/cargo/rustc/docker/node）")
    sub.add_parser("version", help="CLI 版本")

    args = parser.parse_args()
    if args.command == "build":
        _cmd_build()
    elif args.command == "test":
        _cmd_test()
    elif args.command == "qa":
        _cmd_qa(args.level)
    elif args.command == "run":
        _cmd_run(args.foreground)
    elif args.command == "deploy":
        _cmd_deploy()
    elif args.command == "clean":
        _cmd_clean()
    elif args.command == "config":
        _cmd_config(args.config_cmd)
    elif args.command == "status":
        _cmd_status()
    elif args.command == "version":
        _cmd_version()


if __name__ == "__main__":
    main()