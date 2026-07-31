#!/usr/bin/env python3
"""WCAG 2 contrast checker — days-design-system §5.

Colour pairs get measured, never eyeballed. A brand accent chosen on a swatch
usually fails as a text background: ShoreStack's primary button sat at 2.76:1
in six apps for months because it looks fine.

Usage:
    python3 contrast.py "#ffffff" "#5fa8a0"
    python3 contrast.py "#fff,#5fa8a0" "#1b4965,#fcfbf8"   # several pairs
    python3 contrast.py --self-test

Thresholds (WCAG 2.1):
    normal text  AA 4.5:1   AAA 7:1
    large text   AA 3:1     AAA 4.5:1   (>=24px, or >=18.66px bold)
    UI boundary  AA 3:1                 (borders, focus rings, icons)
"""

import sys


def _parse(hex_colour: str) -> tuple[float, float, float]:
    h = hex_colour.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6 or any(c not in "0123456789abcdefABCDEF" for c in h):
        raise ValueError(f"not a hex colour: {hex_colour!r}")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def luminance(hex_colour: str) -> float:
    """Relative luminance per WCAG 2, sRGB."""

    def channel(v: float) -> float:
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(v) for v in _parse(hex_colour))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def report(fg: str, bg: str) -> bool:
    r = ratio(fg, bg)
    checks = [
        ("normal AA", 4.5),
        ("normal AAA", 7.0),
        ("large AA", 3.0),
        ("UI boundary", 3.0),
    ]
    verdicts = " ".join(
        f"{name} {'PASS' if r >= t else 'FAIL'}" for name, t in checks
    )
    print(f"{r:6.2f}:1  {fg} on {bg}   {verdicts}")
    return r >= 4.5


def _self_test() -> int:
    """Known-good values, so a refactor of the maths can't pass silently."""
    cases = [
        ("#000000", "#ffffff", 21.00),
        ("#ffffff", "#ffffff", 1.00),
        ("#ffffff", "#5fa8a0", 2.76),  # ShoreStack primary button — fails AA
        ("#1b4965", "#fcfbf8", 9.28),  # ShoreStack body text — passes
    ]
    failures = 0
    for fg, bg, expected in cases:
        got = ratio(fg, bg)
        ok = abs(got - expected) < 0.01
        print(f"{'ok  ' if ok else 'FAIL'} {fg} on {bg}: {got:.2f} (want {expected})")
        failures += 0 if ok else 1
    print("self-test passed" if not failures else f"{failures} self-test FAILURES")
    return 1 if failures else 0


def main(argv: list[str]) -> int:
    args = argv[1:]
    if not args or args[0] in {"-h", "--help"}:
        print(__doc__)
        return 0
    if args[0] == "--self-test":
        return _self_test()

    pairs = []
    if len(args) == 2 and "," not in args[0]:
        pairs = [(args[0], args[1])]
    else:
        for arg in args:
            fg, _, bg = arg.partition(",")
            if not bg:
                print(f"expected 'fg,bg' but got {arg!r}", file=sys.stderr)
                return 2
            pairs.append((fg, bg))

    all_pass = True
    for fg, bg in pairs:
        try:
            all_pass &= report(fg, bg)
        except ValueError as err:
            print(err, file=sys.stderr)
            return 2
    return 0 if all_pass else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
