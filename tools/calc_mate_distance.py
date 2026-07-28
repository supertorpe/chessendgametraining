#!/usr/bin/env python3
"""Precalculate the mate distance of every non-drawing position in the endgame database.

Writes a `mateIn` field (full moves, from the point of view of the side to move) into each
game entry of code/src/static/endgamedatabase.json, so the app can show the length of the
win without going online.

Two sources, in order:

  1. Tablebase DTM, when the online tablebase has it. This is exact.
  2. Otherwise, best effort: let stockfish play both sides until the position is small
     enough for the tablebase to report DTM, then add the plies played on the way. Entries
     produced this way are flagged with `mateInApprox: true`, because stockfish's line is
     not a proven shortest mate.

Positions where neither works are left without a `mateIn` field.

Results are cached in tools/.mate-distance-*.json so an interrupted run resumes instead of
recomputing. Only definitive answers are cached; a position that failed because the
tablebase was unreachable is retried on the next run. Delete both files to force a rebuild.

The database is only written when a run completes: an interrupted run leaves it untouched,
because a half-annotated database with a bumped version would ship to every user as if it
were finished.

Usage:
    python tools/calc_mate_distance.py                        # exact values only, ~20 min
    python tools/calc_mate_distance.py --stockfish ./stockfish --syzygy ./syzygy
    python tools/calc_mate_distance.py --limit 40 --dry-run   # trial run, writes nothing
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import chess
    import chess.engine
except ImportError:
    sys.exit("This script needs python-chess:  pip install chess")


REPO_ROOT = Path(__file__).resolve().parents[1]
DATABASE = REPO_ROOT / "code" / "src" / "static" / "endgamedatabase.json"
CACHE = Path(__file__).resolve().parent / ".mate-distance-cache.json"
RESULTS = Path(__file__).resolve().parent / ".mate-distance-results.json"

TABLEBASE_URL = "https://tablebase.lichess.ovh/standard"
USER_AGENT = "chessendgametraining-mate-distance/1.0 (+https://github.com/supertorpe/chessendgametraining)"

# The tablebase only reports DTM for small positions; there is no point asking above this.
DTM_PIECE_LIMIT = 7
# Give up on a position rather than let stockfish wander forever looking for a simplification.
MAX_REDUCTION_PLIES = 120


class TablebaseUnavailable(Exception):
    """The tablebase could not be reached. Distinct from "this position is not covered":
    the first is worth retrying on the next run, the second never is."""


def piece_count(fen: str) -> int:
    return sum(1 for ch in fen.split()[0] if ch.isalpha())


def plies_to_moves(plies: int) -> int:
    """A mate `plies` half-moves away is announced as mate in ceil(plies / 2)."""
    return math.ceil(plies / 2)


class Tablebase:
    """Online tablebase, with an on-disk cache of the raw responses."""

    def __init__(self, delay: float):
        self.delay = delay
        self.cache: dict[str, dict] = {}
        if CACHE.exists():
            try:
                self.cache = json.loads(CACHE.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                print(f"  ! ignoring unreadable cache {CACHE.name}", file=sys.stderr)
        self.queries = 0

    def probe(self, fen: str) -> dict | None:
        """Returns the tablebase response, or None if the position is out of reach.

        Raises TablebaseUnavailable when the lookup failed for reasons that may not apply
        next time, so the caller can decline to cache the outcome.
        """
        if fen in self.cache:
            return self.cache[fen]
        if piece_count(fen) > DTM_PIECE_LIMIT:
            return None
        request = urllib.request.Request(
            f"{TABLEBASE_URL}?fen={urllib.parse.quote(fen)}",
            headers={"User-Agent": USER_AGENT},
        )
        data = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=20) as response:
                    data = json.load(response)
                break
            except urllib.error.HTTPError as error:
                if 400 <= error.code < 500:
                    # The server understood us and said no; asking again will not help.
                    raise TablebaseUnavailable(f"HTTP {error.code} for {fen}") from error
                if attempt == 3:
                    raise TablebaseUnavailable(f"HTTP {error.code} for {fen}") from error
                time.sleep(2 ** attempt)
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
                if attempt == 3:
                    raise TablebaseUnavailable(f"{type(error).__name__} for {fen}") from error
                time.sleep(2 ** attempt)
        self.queries += 1
        self.cache[fen] = data
        time.sleep(self.delay)  # the tablebase is a free service; do not hammer it
        return data

    def save(self) -> None:
        CACHE.write_text(json.dumps(self.cache), encoding="utf-8")


def exact_mate_distance(tablebase: Tablebase, fen: str) -> tuple[int | None, str]:
    """Mate distance straight from the tablebase. Returns (moves, note)."""
    data = tablebase.probe(fen)
    if data is None:
        return None, "no-tablebase"
    category = data.get("category")
    if category in ("cursed-win", "maybe-win"):
        # A cursed win needs more than 50 moves to convert, so under the 50-move rule it is
        # a draw and there is no honest mate distance to announce. "maybe-win" is a win whose
        # distance the tablebase could not measure, which is the same problem.
        return None, f"unmeasurable ({category})"
    if category != "win":
        # A position filed under "checkmate" that the tablebase does not consider won is
        # worth reporting: either the target or the FEN is wrong.
        return None, f"not-won ({category})"
    dtm = data.get("dtm")
    if dtm is None:
        return None, "no-dtm"
    if dtm <= 0:
        return None, "side-to-move-is-mated"
    return plies_to_moves(dtm), "exact"


def approximate_mate_distance(
    tablebase: Tablebase, engine: chess.engine.SimpleEngine, fen: str, limit: chess.engine.Limit
) -> tuple[int | None, str]:
    """Play stockfish's line until the tablebase can finish the count.

    Everything is measured from the point of view of the side to move in the ORIGINAL
    position, which is the side the stored value describes. After an odd number of
    reduction plies the board's side to move is that player's opponent, so every score read
    off the board has to be turned back round.
    """
    try:
        board = chess.Board(fen)
    except ValueError as error:
        # Two entries in the shipped database are not legal FEN; do not take the run down.
        return None, f"invalid-fen ({error})"

    plies = 0
    while plies < MAX_REDUCTION_PLIES:
        # The original mover is the side to move exactly when an even number of plies
        # has been played.
        original_to_move = plies % 2 == 0

        if board.is_game_over():
            outcome = board.outcome()
            if outcome is None or outcome.winner is None:
                return None, "reduced-to-draw"
            # Whoever just moved delivered the mate; that was the original mover iff the
            # side now to move is not.
            if original_to_move:
                return None, "reduction-lost-the-win"
            return plies_to_moves(plies), "approx-played-out"

        if piece_count(board.fen()) <= DTM_PIECE_LIMIT:
            data = tablebase.probe(board.fen())
            if data and data.get("dtm") is not None:
                dtm = data["dtm"]
                if not original_to_move:
                    dtm = -dtm
                if dtm <= 0:
                    return None, "reduction-lost-the-win"
                return plies_to_moves(plies + dtm), "approx"

        info = engine.analyse(board, limit)
        score = info["score"].pov(board.turn)
        if score.is_mate():
            mate_in = score.mate()
            if mate_in is None:
                return None, "engine-sees-no-win"
            # UCI counts mate in moves relative to the side to move: `mate n` is 2n-1 plies
            # away and won by the side to move, `mate -n` is 2n plies away and won by its
            # opponent.
            if mate_in > 0:
                winner_to_move, plies_from_here = True, 2 * mate_in - 1
            else:
                winner_to_move, plies_from_here = False, 2 * -mate_in
            if winner_to_move != original_to_move:
                # The mate belongs to the defender, so there is nothing to promise.
                return None, "engine-sees-no-win"
            return plies_to_moves(plies + plies_from_here), "approx-engine-mate"

        move = info.get("pv", [None])[0]
        if move is None:
            move = engine.play(board, limit).move
        if move is None:
            return None, "no-move"
        board.push(move)
        plies += 1

    return None, "gave-up"


def compute(
    tablebase: Tablebase,
    engine: chess.engine.SimpleEngine | None,
    fen: str,
    limit: chess.engine.Limit,
) -> tuple[int | None, str, bool]:
    """Returns (moves, note, cacheable). Transient failures are not cacheable."""
    try:
        moves, note = exact_mate_distance(tablebase, fen)
    except TablebaseUnavailable as error:
        return None, f"tablebase-unavailable ({error})", False

    if moves is None and note in ("no-tablebase", "no-dtm") and engine is not None:
        try:
            moves, note = approximate_mate_distance(tablebase, engine, fen, limit)
        except TablebaseUnavailable as error:
            return None, f"tablebase-unavailable ({error})", False

    return moves, note, True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--stockfish", help="path to the stockfish binary (omit to skip the best-effort pass)")
    parser.add_argument("--movetime", type=float, default=1.0, help="seconds per move (default: 1.0)")
    parser.add_argument(
        "--depth",
        type=int,
        help="search to a fixed depth instead of a time budget. Accurate but open ended: pawn "
        "endgames can sit at depth 30 for many minutes, so prefer --movetime for a full run",
    )
    parser.add_argument("--syzygy", help="path to local syzygy tablebases; lets stockfish play the reduction better")
    parser.add_argument("--threads", type=int, default=1, help="stockfish threads (default: 1)")
    parser.add_argument("--hash", type=int, default=256, help="stockfish hash in MB (default: 256)")
    parser.add_argument("--delay", type=float, default=0.3, help="seconds between tablebase calls (default: 0.3)")
    parser.add_argument("--limit", type=int, help="only process the first N positions, for a trial run")
    parser.add_argument("--dry-run", action="store_true", help="report what would change without writing the database")
    args = parser.parse_args()

    if args.limit and not args.dry_run:
        parser.error("--limit only makes sense with --dry-run: a partial pass would write a partial database")

    database = json.loads(DATABASE.read_text(encoding="utf-8"))

    positions = [
        game
        for category in database["categories"]
        for subcategory in category["subcategories"]
        for game in subcategory["games"]
        if game.get("target") != "draw"
    ]
    if args.limit:
        positions = positions[: args.limit]

    tablebase = Tablebase(args.delay)
    engine = None
    if args.stockfish:
        engine = chess.engine.SimpleEngine.popen_uci(args.stockfish)
        options = {"Threads": args.threads, "Hash": args.hash}
        if args.syzygy:
            options["SyzygyPath"] = args.syzygy
        engine.configure(options)
    search_limit = (
        chess.engine.Limit(depth=args.depth) if args.depth else chess.engine.Limit(time=args.movetime)
    )
    # Approximate answers depend on how hard stockfish looked, so a cached one is only
    # reusable by a run that searched at least as hard.
    search_key = f"depth:{args.depth}" if args.depth else f"movetime:{args.movetime}"

    # The stockfish pass costs seconds per position, so remember what it worked out.
    # Without this, stopping a multi-hour run halfway would throw all of it away.
    results: dict[str, list] = {}
    if RESULTS.exists():
        try:
            results = json.loads(RESULTS.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            print(f"  ! ignoring unreadable cache {RESULTS.name}", file=sys.stderr)

    def cached(fen: str) -> tuple[int | None, str] | None:
        entry = results.get(fen)
        if entry is None:
            return None
        moves, note = entry[0], entry[1]
        if note.startswith("approx") and (len(entry) < 3 or entry[2] != search_key):
            return None  # produced by a different search; work it out again
        return moves, note

    counts: dict[str, int] = {}
    anomalies: list[tuple[str, str]] = []
    completed = False
    started = time.time()

    def persist() -> None:
        tablebase.save()
        RESULTS.write_text(json.dumps(results), encoding="utf-8")

    try:
        for index, game in enumerate(positions, start=1):
            fen = game["fen"]
            hit = cached(fen)
            if hit is not None:
                moves, note = hit
            else:
                moves, note, cacheable = compute(tablebase, engine, fen, search_limit)
                if cacheable:
                    results[fen] = [moves, note, search_key]

            if moves is not None:
                game["mateIn"] = moves
                if note.startswith("approx"):
                    game["mateInApprox"] = True
                else:
                    game.pop("mateInApprox", None)
            else:
                # A rerun that can no longer work a position out must not leave the old
                # answer lying around.
                game.pop("mateIn", None)
                game.pop("mateInApprox", None)
                if note.startswith("not-won") or note.startswith("invalid-fen"):
                    anomalies.append((fen, note))

            key = note.split(" (")[0]
            counts[key] = counts.get(key, 0) + 1
            if index % 25 == 0 or index == len(positions):
                elapsed = time.time() - started
                print(
                    f"  {index}/{len(positions)}  ({elapsed:.0f}s, {tablebase.queries} tablebase calls)",
                    flush=True,
                )
                persist()
        completed = True
    except KeyboardInterrupt:
        print("\ninterrupted; progress is cached, rerun to resume")
    finally:
        persist()
        if engine is not None:
            engine.quit()

    print("\nresults:")
    for note, count in sorted(counts.items(), key=lambda item: -item[1]):
        print(f"  {count:>5}  {note}")

    if anomalies:
        print(f"\n{len(anomalies)} position(s) the database gets wrong:")
        for fen, note in anomalies:
            print(f"  {fen}   {note}")

    if not completed:
        print("\nrun did not finish: database left untouched")
        return 1
    if args.dry_run:
        print("\ndry run: database not written")
        return 0

    database["version"] = database.get("version", 0) + 1
    DATABASE.write_text(json.dumps(database, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nwrote {DATABASE.relative_to(REPO_ROOT)} (version {database['version']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
