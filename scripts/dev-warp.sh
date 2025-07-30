#!/bin/bash

# Open current project directory in Warp
# This script opens Warp and navigates to the prayer-requests project

PROJECT_DIR="/Users/MichaelD/Developer/prayer-requests"

echo "Opening prayer-requests project in Warp..."
echo "Project directory: $PROJECT_DIR"

# Open Warp with the project directory
open -a Warp "$PROJECT_DIR"

echo "Warp should now open with your project directory."
echo "You can run: pnpm run dev" 