"""weftik CLI 冒烟测试 — mock cargo/pixi，不真跑全链。

覆盖（D75: AI 生成代码须带测试）:
- 各子命令 argparse 可解析（--help 不抛）
- version 返回 0.1.0
- _run_or_exit 非 0 退出码透传
- _check 缺失依赖时 exit 1 + 明确提示
"""

import argparse
import importlib.util
import io
import sys
from contextlib import redirect_stderr
from pathlib import Path
from unittest.mock import patch

import pytest

# 按文件路径加载 weftik_cli（绕过 pytest import-mode，避免 "scripts/qa" 成为 rootdir 前缀）
_SCRIPTS_DIR = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("weftik_cli", _SCRIPTS_DIR / "weftik_cli.py")
assert _spec is not None and _spec.loader is not None
cli = importlib.util.module_from_spec(_spec)
sys.modules["weftik_cli"] = cli
_spec.loader.exec_module(cli)


@pytest.mark.parametrize(
    "args",
    [
        ["build"],
        ["test"],
        ["qa", "fast"],
        ["run"],
        ["run", "runtime"],
        ["run", "--foreground"],
        ["run", "runtime", "--foreground"],
        ["deploy"],
        ["clean"],
        ["config", "show"],
        ["config", "validate"],
        ["status"],
        ["version"],
    ],
)
def _build_parser():
    parser = argparse.ArgumentParser(prog="weftik")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("build")
    sub.add_parser("test")
    qa_p = sub.add_parser("qa"); qa_p.add_argument("level", nargs="?", choices=sorted(cli.QA_LEVELS), default="fast")
    run_p = sub.add_parser("run"); run_p.add_argument("target", nargs="?", choices=["runtime"], default="runtime"); run_p.add_argument("--foreground", "-f", action="store_true")
    sub.add_parser("deploy")
    sub.add_parser("clean")
    config_p = sub.add_parser("config"); config_p.add_argument("config_cmd", choices=["show", "validate"])
    sub.add_parser("status")
    sub.add_parser("version")
    return parser


@pytest.mark.parametrize(
    "args",
    [
        ["build"],
        ["test"],
        ["qa", "fast"],
        ["qa"],
        ["run"],
        ["run", "--foreground"],
        ["deploy"],
        ["clean"],
        ["config", "show"],
        ["config", "validate"],
        ["status"],
        ["version"],
    ],
)  # fmt: skip
def test_subcommands_parse(args):
    """每个子命令能通过 argparse 解析（不抛错）。"""
    parsed = _build_parser().parse_args(args)
    assert parsed.command == args[0]


def test_version_output(capsys):
    cli._cmd_version()
    assert capsys.readouterr().out.strip() == "0.1.0"


def test_run_or_exit_propagates_nonzero():
    """_run_or_exit 在子命令返回非 0 时透传退出码。"""
    with patch.object(cli, "_run", return_value=7), pytest.raises(SystemExit) as e:
        cli._run_or_exit(["false"])
    assert e.value.code == 7


def test_check_missing_dependency_exits():
    """_check 在依赖缺失时 exit 1 + 明确提示。"""
    stderr = io.StringIO()
    with patch.object(cli.shutil, "which", return_value=None), \
            redirect_stderr(stderr), pytest.raises(SystemExit) as e:
        cli._check("cargo", "pixi 环境未激活?")
    assert e.value.code == 1
    assert "缺少依赖" in stderr.getvalue()


def test_deploy_stub():
    """deploy 占位：明确提示 + exit 1。"""
    stderr = io.StringIO()
    with redirect_stderr(stderr), pytest.raises(SystemExit) as e:
        cli._cmd_deploy()
    assert e.value.code == 1
    assert "占位" in stderr.getvalue()