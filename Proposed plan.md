Objective
Comprehensive review and fix of the entire Tawbah web + mobile app — styles, dark/light mode, all pages, logic, then build APK.

Tasks
T001: Deep exploration of web app styles and themes
Blocked By: []
Details: Read theme config, tailwind config, main CSS, dark mode setup, all component color usages
Files: tawbah-web/src/index.css, tailwind.config*, theme context, App.tsx
Acceptance: Full picture of color system and dark mode implementation
T002: Deep exploration of mobile app styles and themes
Blocked By: []
Details: Read mobile theme config, NativeWind config, colors, dark mode setup
Files: tawbah-mobile/src/, theme provider, app.json
Acceptance: Full picture of mobile color system and dark mode
T003: Screenshot all key web pages for visual audit
Blocked By: [T001]
Details: Screenshot home, quran, zakiy, rajaa, dhikr, sos, plan, journey, etc.
Acceptance: Visual audit completed
T004: Fix web app style/dark-mode issues
Blocked By: [T001, T003]
Details: Fix any missing dark mode classes, inconsistent colors, broken layouts
Acceptance: All pages look correct in both modes
T005: Fix mobile app style issues
Blocked By: [T002]
Details: Fix dark/light mode consistency in mobile
Acceptance: All mobile screens look correct
T006: Logic/API consistency review and fixes
Blocked By: [T001, T002]
Details: Check all API calls match backend routes, fix broken flows
Acceptance: No broken API calls or missing features
T007: Build APK using provided Expo token
Blocked By: [T005, T006]
Details: Use expo token 6cmMyqjDPRG1YrZx4W_rFDetYJUwbuuPFy8fX6RR to build APK
Acceptance: APK built successfully