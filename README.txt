Gmail Stagger Snooze — Instructions
=====================================

WHAT THIS DOES
--------------
This Chrome extension adds a 💤 button to Gmail that lets you snooze
multiple emails in staggered time increments. For example, select 3 emails
and snooze them 15 minutes apart so they come back to your inbox one at a time.


HOW TO USE IT
-------------
1. Go to Gmail (mail.google.com)
2. Click the checkboxes next to the emails you want to snooze
   - The ORDER you click them is the order they'll be snoozed
   - First email clicked = first to come back
3. Click the 💤 button in the bottom right corner of Gmail
4. Set your start time (defaults to the next 15-minute mark)
5. Choose your increment from the dropdown (5, 15, 30 mins, or 1 hour)
6. Click "Snooze Selected"


TIME FORMAT
-----------
The start time field accepts many formats:
  - "7pm"       → 07:00 PM
  - "645pm"     → 06:45 PM
  - "9:30am"    → 09:30 AM
  - "14:00"     → 02:00 PM
  - "0700"      → 07:00 AM

The field will auto-correct your input when you click out of it.
If the border turns red, the format wasn't recognized — try again.


TIPS
----
- The increment you last used is remembered for next time
- Click the ✕ button to collapse the panel back to the 💤 icon
- If the snooze button isn't found, make sure your emails are still
  selected (checkboxes are checked) before clicking Snooze Selected
- Works best with up to ~10 emails at a time


TROUBLESHOOTING
---------------
If the extension stops working after a Gmail update:
1. Go to chrome://extensions/
2. Find "Gmail Stagger Snooze"
3. Click the refresh icon on the extension card
4. Reload Gmail

If it still doesn't work, Gmail may have updated its interface.
The extension may need to be updated to match Gmail's new code.


FILES IN THIS FOLDER
--------------------
  manifest.json   — Required. Tells Chrome this is an extension.
  content.js      — The main extension code.
  README.txt      — This file.

Do not delete manifest.json or content.js or the extension will stop working.


INSTALLATION (if setting up for the first time)
------------------------------------------------
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this folder
5. Go to Gmail and look for the 💤 button in the bottom right
