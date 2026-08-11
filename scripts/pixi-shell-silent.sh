#!/usr/bin/env bash
# pixi-shell-silent.sh — Activate pixi environment WITHOUT banner output.
# Source this in CLI薄壳 (audesys.sh) so command stdout stays clean.
# Same activation as pixi-shell.sh, minus the info echoes.
set -euo pipefail

SCRIPT_DIR_PSHELL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
source "${SCRIPT_DIR_PSHELL}/_common.sh"

eval "$("${PIXI_BIN}" shell-hook --manifest-path "${PROJECT_ROOT}/pixi.toml" --shell bash)"