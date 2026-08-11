#!/usr/bin/env bash
# audesys.sh — AUDESYS CLI 薄壳（Linux/macOS）
# 职责: ① 检测 pixi（缺失提示 bootstrap）② silent 激活环境 ③ 转发到 CLI
# 用法: ./audesys.sh <cmd> [-h]
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

if command -v pixi >/dev/null 2>&1; then
    export PIXI_BIN="$(command -v pixi)"
elif [ -x "$HOME/.pixi/bin/pixi" ]; then
    export PIXI_BIN="$HOME/.pixi/bin/pixi"
else
    echo "pixi 未安装 — 先运行: source bootstrap.sh" >&2
    exit 1
fi

source "$ROOT/scripts/pixi-shell-silent.sh"   # silent 激活（同进程，PATH 注入，无 banner）
exec python "$ROOT/scripts/audesys_cli.py" "$@"