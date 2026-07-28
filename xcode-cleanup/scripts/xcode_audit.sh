#!/bin/bash
# Xcode Developer Data Audit Script
# Scans all known Xcode data locations and reports sizes
# Safe to run — this script is READ-ONLY, it deletes nothing

set -euo pipefail

HOME_DIR="$HOME"
DEV_DIR="$HOME_DIR/Library/Developer"
XCODE_DIR="$DEV_DIR/Xcode"

echo "========================================"
echo "  XCODE DEVELOPER DATA AUDIT"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

TOTAL_BYTES=0
SAFE_BYTES=0
REVIEW_BYTES=0

# Helper: get folder size in bytes and human-readable
get_size() {
    local path="$1"
    if [ -d "$path" ]; then
        local bytes
        bytes=$(du -sk "$path" 2>/dev/null | awk '{print $1}')
        bytes=$((bytes * 1024))
        local human
        human=$(du -sh "$path" 2>/dev/null | awk '{print $1}')
        echo "$bytes|$human"
    else
        echo "0|0B"
    fi
}

# Helper: print section
print_section() {
    local label="$1"
    local path="$2"
    local category="$3"  # SAFE, REVIEW, or REPORT
    local note="$4"

    if [ -d "$path" ]; then
        local result
        result=$(get_size "$path")
        local bytes="${result%%|*}"
        local human="${result##*|}"
        TOTAL_BYTES=$((TOTAL_BYTES + bytes))
        if [ "$category" = "SAFE" ]; then
            SAFE_BYTES=$((SAFE_BYTES + bytes))
        elif [ "$category" = "REVIEW" ]; then
            REVIEW_BYTES=$((REVIEW_BYTES + bytes))
        fi
        echo "[$category] $label"
        echo "  Path: $path"
        echo "  Size: $human"
        [ -n "$note" ] && echo "  Note: $note"
        echo ""
    else
        echo "[SKIP] $label"
        echo "  Path: $path (not found)"
        echo ""
    fi
}

echo "--- DERIVED DATA (Build Caches) ---"
DD_PATH="$XCODE_DIR/DerivedData"
if [ -d "$DD_PATH" ]; then
    result=$(get_size "$DD_PATH")
    bytes="${result%%|*}"
    human="${result##*|}"
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    SAFE_BYTES=$((SAFE_BYTES + bytes))
    echo "[SAFE] DerivedData (total)"
    echo "  Path: $DD_PATH"
    echo "  Size: $human"
    echo "  Note: All build caches. Xcode rebuilds automatically."
    echo ""

    # List individual project folders with sizes
    echo "  Per-project breakdown:"
    if [ "$(ls -A "$DD_PATH" 2>/dev/null)" ]; then
        for proj in "$DD_PATH"/*/; do
            if [ -d "$proj" ]; then
                proj_name=$(basename "$proj")
                proj_result=$(get_size "$proj")
                proj_human="${proj_result##*|}"
                # Get last modified date
                last_mod=$(stat -f "%Sm" -t "%Y-%m-%d" "$proj" 2>/dev/null || echo "unknown")
                echo "    $proj_human  $proj_name  (last modified: $last_mod)"
            fi
        done
    else
        echo "    (empty)"
    fi
    echo ""
else
    echo "[SKIP] DerivedData"
    echo "  Path: $DD_PATH (not found)"
    echo ""
fi

echo "--- SIMULATORS ---"
SIM_PATH="$DEV_DIR/CoreSimulator/Devices"
if [ -d "$SIM_PATH" ]; then
    result=$(get_size "$DEV_DIR/CoreSimulator")
    bytes="${result%%|*}"
    human="${result##*|}"
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    SAFE_BYTES=$((SAFE_BYTES + bytes))
    echo "[SAFE] CoreSimulator (total)"
    echo "  Path: $DEV_DIR/CoreSimulator"
    echo "  Size: $human"
    echo "  Note: Simulator runtimes and device data. Re-downloadable from Xcode > Settings > Platforms."
    echo ""

    # Try to list simulators via xcrun if available
    if command -v xcrun &>/dev/null; then
        echo "  Installed simulator runtimes:"
        xcrun simctl list runtimes 2>/dev/null | grep -v "^==" | head -20 || echo "    (could not list runtimes)"
        echo ""

        echo "  Device count by state:"
        booted=$(xcrun simctl list devices 2>/dev/null | grep -c "Booted" || echo "0")
        shutdown=$(xcrun simctl list devices 2>/dev/null | grep -c "Shutdown" || echo "0")
        echo "    Booted: $booted"
        echo "    Shutdown: $shutdown"
        echo ""

        # Check for unavailable runtimes
        unavail=$(xcrun simctl list devices unavailable 2>/dev/null | grep -c "unavailable" || echo "0")
        if [ "$unavail" -gt 0 ]; then
            echo "  Unavailable simulators (safe to delete): $unavail devices"
            echo "  Run: xcrun simctl delete unavailable"
            echo ""
        fi
    fi
else
    echo "[SKIP] CoreSimulator"
    echo "  Path: $SIM_PATH (not found)"
    echo ""
fi

echo "--- ARCHIVES ---"
ARCHIVE_PATH="$XCODE_DIR/Archives"
if [ -d "$ARCHIVE_PATH" ]; then
    result=$(get_size "$ARCHIVE_PATH")
    bytes="${result%%|*}"
    human="${result##*|}"
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    REVIEW_BYTES=$((REVIEW_BYTES + bytes))
    echo "[REVIEW] Archives"
    echo "  Path: $ARCHIVE_PATH"
    echo "  Size: $human"
    echo "  Note: Contains .xcarchive builds. Needed for crash symbolication (dSYMs). Archives older than 90 days flagged."
    echo ""

    # List archives by date folder
    echo "  Archives by date:"
    if [ "$(ls -A "$ARCHIVE_PATH" 2>/dev/null)" ]; then
        for date_dir in "$ARCHIVE_PATH"/*/; do
            if [ -d "$date_dir" ]; then
                dir_name=$(basename "$date_dir")
                dir_result=$(get_size "$date_dir")
                dir_human="${dir_result##*|}"
                # Check if older than 90 days
                dir_epoch=$(stat -f "%m" "$date_dir" 2>/dev/null || echo "0")
                now_epoch=$(date +%s)
                age_days=$(( (now_epoch - dir_epoch) / 86400 ))
                if [ "$age_days" -gt 90 ]; then
                    echo "    $dir_human  $dir_name  (${age_days} days old - STALE)"
                else
                    echo "    $dir_human  $dir_name  (${age_days} days old)"
                fi
            fi
        done
    else
        echo "    (none)"
    fi
    echo ""
else
    echo "[SKIP] Archives"
    echo "  Path: $ARCHIVE_PATH (not found)"
    echo ""
fi

echo "--- DEVICE SUPPORT ---"
for platform in "iOS" "watchOS" "tvOS"; do
    ds_path="$XCODE_DIR/${platform} DeviceSupport"
    if [ -d "$ds_path" ]; then
        result=$(get_size "$ds_path")
        bytes="${result%%|*}"
        human="${result##*|}"
        TOTAL_BYTES=$((TOTAL_BYTES + bytes))
        REVIEW_BYTES=$((REVIEW_BYTES + bytes))
        echo "[REVIEW] ${platform} Device Support"
        echo "  Path: $ds_path"
        echo "  Size: $human"
        echo "  Note: Downloaded when connecting physical devices. Old OS versions can be removed."

        # List versions
        echo "  Versions:"
        if [ "$(ls -A "$ds_path" 2>/dev/null)" ]; then
            for ver in "$ds_path"/*/; do
                if [ -d "$ver" ]; then
                    ver_name=$(basename "$ver")
                    ver_result=$(get_size "$ver")
                    ver_human="${ver_result##*|}"
                    echo "    $ver_human  $ver_name"
                fi
            done
        fi
        echo ""
    fi
done

echo "--- CACHES & DOWNLOADS ---"
print_section "DVTDownloads" "$DEV_DIR/DVTDownloads" "SAFE" "Downloaded components. Re-downloaded on demand."
print_section "XCTestDevices" "$DEV_DIR/XCTestDevices" "SAFE" "Test device data. Rebuilt when tests run."
print_section "Xcode Cache" "$HOME_DIR/Library/Caches/com.apple.dt.Xcode" "SAFE" "General Xcode cache. Rebuilt automatically."

# Also check for old Instruments data
INSTRUMENTS_PATH="$HOME_DIR/Library/Developer/Xcode/Products"
if [ -d "$INSTRUMENTS_PATH" ]; then
    print_section "Xcode Products" "$INSTRUMENTS_PATH" "SAFE" "Old build products."
fi

echo "--- XCODE APPLICATION ---"
XCODE_APP="/Applications/Xcode.app"
if [ -d "$XCODE_APP" ]; then
    result=$(get_size "$XCODE_APP")
    bytes="${result%%|*}"
    human="${result##*|}"
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    echo "[REPORT] Xcode.app"
    echo "  Path: $XCODE_APP"
    echo "  Size: $human"
    echo "  Note: The Xcode application itself. Not recommended to delete via this tool."
    echo ""

    # Check for extra platform SDKs
    echo "  Bundled platform SDKs:"
    PLATFORMS_DIR="$XCODE_APP/Contents/Developer/Platforms"
    if [ -d "$PLATFORMS_DIR" ]; then
        for plat in "$PLATFORMS_DIR"/*.platform; do
            if [ -d "$plat" ]; then
                plat_name=$(basename "$plat" .platform)
                plat_result=$(get_size "$plat")
                plat_human="${plat_result##*|}"
                echo "    $plat_human  $plat_name"
            fi
        done
    fi
    echo ""

    # Check for additional downloadable platforms
    echo "  Additional downloaded platforms (removable via Xcode > Settings > Platforms):"
    EXTRA_PLATFORMS="$XCODE_APP/Contents/Developer/Platforms"
    for extra in "AppleTVOS" "WatchOS" "XROS"; do
        extra_path="$EXTRA_PLATFORMS/${extra}.platform"
        if [ -d "$extra_path" ]; then
            ep_result=$(get_size "$extra_path")
            ep_human="${ep_result##*|}"
            echo "    $ep_human  $extra (removable if not targeting this platform)"
        fi
    done
    echo ""
fi

# Check for Xcode-beta
XCODE_BETA="/Applications/Xcode-beta.app"
if [ -d "$XCODE_BETA" ]; then
    result=$(get_size "$XCODE_BETA")
    bytes="${result%%|*}"
    human="${result##*|}"
    TOTAL_BYTES=$((TOTAL_BYTES + bytes))
    echo "[REPORT] Xcode-beta.app"
    echo "  Path: $XCODE_BETA"
    echo "  Size: $human"
    echo "  Note: Beta version of Xcode. Can be removed if you don't need beta features."
    echo ""
fi

echo "========================================"
echo "  SUMMARY"
echo "========================================"

# Convert bytes to human-readable
to_human() {
    local bytes=$1
    if [ "$bytes" -ge 1073741824 ]; then
        echo "$(echo "scale=1; $bytes/1073741824" | bc) GB"
    elif [ "$bytes" -ge 1048576 ]; then
        echo "$(echo "scale=1; $bytes/1048576" | bc) MB"
    else
        echo "$(echo "scale=1; $bytes/1024" | bc) KB"
    fi
}

echo ""
echo "Total Xcode footprint:       $(to_human $TOTAL_BYTES)"
echo "Safe to delete:              $(to_human $SAFE_BYTES)"
echo "Review before deleting:      $(to_human $REVIEW_BYTES)"
echo "Report only (Xcode.app etc): $(to_human $((TOTAL_BYTES - SAFE_BYTES - REVIEW_BYTES)))"
echo ""
echo "========================================"
echo "  AUDIT COMPLETE"
echo "========================================"
