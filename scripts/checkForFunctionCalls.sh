#!/usr/bin/env bash

# check_for_function_calls.sh
# This script scans all route.ts files in ./src/app/api recursively
# and checks for the presence of specified function calls.
# If any required function call is missing, it reports the parent folder name
# along with the missing calls and exits with a failure code.

# Configuration
API_DIR="./src/app/api"  # Path to the API directory
TARGET_FILENAME="route.ts"  # Filename to search for
DEFAULT_REQUIRED_CALLS=("await validateUser(" "roleHasPermissionServerSide(")

# Use provided arguments as required calls if any
if [ $# -gt 0 ]; then
    REQUIRED_CALLS=("$@")
else
    REQUIRED_CALLS=("${DEFAULT_REQUIRED_CALLS[@]}")
fi

# Log the API directory and required calls
echo "Scanning directory: $API_DIR"
echo "Required calls: ${REQUIRED_CALLS[*]}"

# Check if the API directory exists
if [ ! -d "$API_DIR" ]; then
    echo "Error: Directory '$API_DIR' does not exist. Please verify that the path is correct and ensure the directory has been created."
    exit 1
fi

# Initialize a flag to track missing calls
missing_calls_found=false

echo "Searching for files named '$TARGET_FILENAME'..."
while IFS= read -r -d '' file; do
    parent_dir=$(basename "$(dirname "$file")")
    missing_calls=()
    
    # Check each required call
    for call in "${REQUIRED_CALLS[@]}"; do
        if ! grep -qF "$call" "$file"; then
            missing_calls+=("$call")
        fi
    done

    if [ ${#missing_calls[@]} -ne 0 ]; then
        missing_calls_found=true
        echo "Folder: $parent_dir"
        for missing_call in "${missing_calls[@]}"; do
            echo "    Missing call: '$missing_call'"
        done
    fi
done < <(find "$API_DIR" -type f -name "$TARGET_FILENAME" -print0)

# Final Results
if [ "$missing_calls_found" = true ]; then
    echo "🚨 Found missing required function calls."
    exit 1
else
    echo "✅ All route.ts files contain the required function calls."
    exit 0
fi
