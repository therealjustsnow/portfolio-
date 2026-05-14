#!/usr/bin/env python3
"""
Count NanoBot commands by statically parsing the cog source.

Classifies every command as public / restricted / owner and reports a total
that includes the dynamically-registered fun commands (social + react actions).

Usage:
    scripts/count-commands.py <nanobot-repo>
        Print counts as JSON.

    scripts/count-commands.py <nanobot-repo> --update <html-file>
        Also rewrite the "By the numbers" stat-card values in the HTML file
        (nanobot-docs.html) in place.

<nanobot-repo> is the root of a NanoBot checkout — the directory containing
cogs/. The numbers shown on nanobot-docs.html are derived from this script.

Counting rules:
  - Every @command / @hybrid_command / @hybrid_group / @<group>.command
    decorator on a direct method of a Cog class counts once. Nested factory
    templates (fun's social_cmd / react_cmd) are skipped automatically.
  - Each entry in fun.py's _SOCIAL_ACTIONS / _REACT_ACTIONS dict is a
    dynamically-registered prefix command and counts once.
  - Owner:      cog gates everything via a cog_check that calls is_owner,
                or the command itself has @commands.is_owner.
  - Restricted: command has a permission-check decorator, or lives under an
                app_commands.Group / hybrid_group carrying default_permissions.
  - Public:     everything else (including all dynamic fun commands).
"""

import ast
import json
import re
import sys
from pathlib import Path

# Permission-check decorators that gate a command to server staff.
RESTRICT_DECORATOR_NAMES = {
    "has_admin_perms", "has_ban_perms", "has_kick_perms", "has_mod_perms",
    "has_channel_perms", "has_timeout_perms", "has_role_perms", "has_move_perms",
}
RESTRICT_DECORATOR_ATTRS = {
    "has_permissions", "has_guild_permissions", "default_permissions",
}
COMMAND_DECORATOR_ATTRS = {"command", "hybrid_command", "hybrid_group", "group"}
GROUP_DECORATOR_ATTRS = {"hybrid_group", "group"}

# Dicts in fun.py whose entries each become a registered prefix command.
DYNAMIC_COMMAND_DICTS = ("_SOCIAL_ACTIONS", "_REACT_ACTIONS")

STAT_LABELS = {
    "total": "Total commands",
    "public": "Public commands",
    "restricted": "Restricted commands",
    "owner": "Owner admin commands",
}


def _decorator_call(dec):
    return dec.func if isinstance(dec, ast.Call) else dec


def _inspect(func_node):
    """Return (command_kind, command_base, has_restrict, has_owner) for a function."""
    kind = base = None
    has_restrict = has_owner = False
    for dec in func_node.decorator_list:
        call = _decorator_call(dec)
        if isinstance(call, ast.Attribute):
            if call.attr in COMMAND_DECORATOR_ATTRS and kind is None:
                kind = call.attr
                base = call.value.id if isinstance(call.value, ast.Name) else ""
            if call.attr in RESTRICT_DECORATOR_ATTRS:
                has_restrict = True
            if call.attr == "is_owner":
                has_owner = True
        elif isinstance(call, ast.Name) and call.id in RESTRICT_DECORATOR_NAMES:
            has_restrict = True
    return kind, base, has_restrict, has_owner


def _scan_group_vars(class_node):
    """Map app_commands.Group variable names -> restricted? (resolves parent= chains)."""
    raw = {}  # name -> (has_default_permissions, parent_name_or_None)
    for node in class_node.body:
        if isinstance(node, ast.Assign):
            targets = [t.id for t in node.targets if isinstance(t, ast.Name)]
        elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            targets = [node.target.id]
        else:
            continue
        if not targets or not isinstance(node.value, ast.Call):
            continue
        func = node.value.func
        is_group = (
            (isinstance(func, ast.Attribute) and func.attr == "Group")
            or (isinstance(func, ast.Name) and func.id == "Group")
        )
        if not is_group:
            continue
        has_perms = any(kw.arg == "default_permissions" for kw in node.value.keywords)
        parent = next(
            (kw.value.id for kw in node.value.keywords
             if kw.arg == "parent" and isinstance(kw.value, ast.Name)),
            None,
        )
        for name in targets:
            raw[name] = (has_perms, parent)

    def restricted(name, seen=None):
        seen = seen or set()
        if name not in raw or name in seen:
            return False
        seen.add(name)
        has_perms, parent = raw[name]
        return has_perms or (parent is not None and restricted(parent, seen))

    return {name: restricted(name) for name in raw}


def _is_owner_cog(class_node):
    """True if the cog gates every command via a cog_check that calls is_owner."""
    for node in class_node.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "cog_check":
            return any(
                isinstance(sub, ast.Attribute) and sub.attr == "is_owner"
                for sub in ast.walk(node)
            )
    return False


def classify(repo):
    cogs_dir = repo / "cogs"
    if not cogs_dir.is_dir():
        sys.exit(f"error: {cogs_dir} not found — pass the NanoBot repo root")

    public = restricted = owner = dynamic = 0

    for path in sorted(cogs_dir.glob("*.py")):
        tree = ast.parse(path.read_text(), filename=str(path))

        # Dynamically-registered fun commands (one per dict entry).
        for node in ast.walk(tree):
            if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
                target = node.target.id
            elif isinstance(node, ast.Assign) and len(node.targets) == 1 \
                    and isinstance(node.targets[0], ast.Name):
                target = node.targets[0].id
            else:
                continue
            if target in DYNAMIC_COMMAND_DICTS and isinstance(node.value, ast.Dict):
                dynamic += len(node.value.keys)

        for class_node in (n for n in tree.body if isinstance(n, ast.ClassDef)):
            owner_cog = _is_owner_cog(class_node)
            group_restricted = _scan_group_vars(class_node)

            methods = [
                n for n in class_node.body
                if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
            ]

            # Pass 1: hybrid_group / group functions are themselves group bases.
            for node in methods:
                kind, _, has_restrict, _ = _inspect(node)
                if kind in GROUP_DECORATOR_ATTRS:
                    group_restricted[node.name] = (
                        has_restrict or group_restricted.get(node.name, False)
                    )

            # Pass 2: classify every command (direct methods only — nested
            # factory templates are not in class_node.body).
            for node in methods:
                kind, base, has_restrict, has_owner = _inspect(node)
                if kind is None:
                    continue
                if owner_cog or has_owner:
                    owner += 1
                elif has_restrict or group_restricted.get(base, False):
                    restricted += 1
                else:
                    public += 1

    public += dynamic  # dynamic fun commands are ungated
    total = public + restricted + owner

    if total < 50:
        sys.exit(f"error: only {total} commands found — the parser is likely "
                 "out of date with NanoBot's structure")

    return {
        "total": total,
        "public": public,
        "restricted": restricted,
        "owner": owner,
        "dynamic": dynamic,
    }


def update_html(html_path, counts):
    text = original = html_path.read_text()

    text, n = re.subn(
        r"\b\d+ command definitions\b",
        f"{counts['total']} command definitions",
        text,
        count=1,
    )
    if n != 1:
        sys.exit(f"error: could not find the 'command definitions' line in {html_path}")

    for key, label in STAT_LABELS.items():
        pattern = (
            r'(<p class="stat-card__value">)\d+(</p>\s*'
            r'<h2 class="stat-card__label">' + re.escape(label) + r"</h2>)"
        )
        text, n = re.subn(
            pattern,
            lambda m, v=counts[key]: f"{m.group(1)}{v}{m.group(2)}",
            text,
        )
        if n != 1:
            sys.exit(f"error: expected exactly one '{label}' stat card in "
                     f"{html_path}, found {n}")

    if text != original:
        html_path.write_text(text)
        return True
    return False


def main(argv):
    if not argv:
        sys.exit(__doc__)

    repo = Path(argv[0])
    counts = classify(repo)

    if "--update" in argv:
        i = argv.index("--update")
        if i + 1 >= len(argv):
            sys.exit("error: --update requires an HTML file path")
        counts["html_updated"] = update_html(Path(argv[i + 1]), counts)

    print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main(sys.argv[1:])
