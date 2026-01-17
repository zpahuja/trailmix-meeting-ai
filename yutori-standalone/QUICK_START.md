# 🚀 Quick Start Guide

Get up and running with the Yutori API Test Suite in 30 seconds!

## Method 1: Launch Script (Easiest)

```bash
cd /Users/soojin/trailmix-meeting-ai/yutori-standalone
./launch.sh
```

The test suite will open in your default browser.

## Method 2: Direct Open

```bash
open /Users/soojin/trailmix-meeting-ai/yutori-standalone/index.html
```

## Using the Test Suite

### Step 1: Start Research
1. The API key is **already pre-filled**
2. The default query is: `b2g procurement enterprise contract, fundraise news`
3. Click the **"🚀 Start Research"** button

### Step 2: Wait for Results
- Progress bar shows real-time status
- Polling happens automatically every 2 seconds
- Typically takes 30-60 seconds

### Step 3: View Results
- Results appear as cards with:
  - Title and description
  - Contract value/amount
  - Deadline information
  - Links to full opportunities

### Step 4: Generate Email
1. Click **"📧 Generate Follow-up Email"**
2. Optionally customize:
   - Recipient name
   - Your name
   - Company name
3. Click **"📋 Copy to Clipboard"**
4. Paste into your email client

## What You'll See

### Successful Research Flow

```
1. Status: "Creating research scout..." ⏳
   ↓
2. Status: "Polling for results... (1/30)" 🔄
   ↓
3. Status: "Research completed!" ✅
   ↓
4. Results display with cards 📊
   ↓
5. Generate and copy email 📧
```

### Example Result Card

```
┌──────────────────────────────────────────┐
│ Enterprise Cloud Security Contract      │
│                                          │
│ The Department of Defense seeks         │
│ proposals for cloud security...         │
│                                          │
│ 💰 $5.2M    📅 Feb 28, 2026             │
│                                          │
│ Read more →                              │
└──────────────────────────────────────────┘
```

## Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔍 **Scout Creation** | Create research scouts with custom queries |
| 🔄 **Auto Polling** | Automatic result retrieval every 2 seconds |
| 📊 **Results Display** | Beautiful card-based layout |
| 📧 **Email Generator** | Professional follow-up email templates |
| 🐛 **Debug Logger** | View all API requests/responses |
| 📱 **Responsive** | Works on desktop and mobile |

## Customization

### Change Search Query

Replace the default query with your own:
```
government contract technology procurement
```

```
federal funding healthcare innovation
```

```
state procurement cybersecurity RFP
```

### Modify Email Options

Before generating, fill in:
- **Recipient name**: Who you're emailing (default: "John")
- **Your name**: Your signature (default: "Jane Smith")
- **Company name**: For context (default: "Acme Corp")

## Debug Mode

Click **"Show/Hide"** under "API Response Debug" to see:
- All API requests (URL, method, body)
- All API responses (formatted JSON)
- Timestamps for each interaction

This is useful for:
- Understanding the API structure
- Debugging issues
- Learning how the API works

## Common Use Cases

### Use Case 1: Research B2G Opportunities
```
Query: "b2g procurement contract opportunities 2026"
→ Find active government contracts
→ Generate email for business development team
```

### Use Case 2: Track Fundraising News
```
Query: "startup funding series A B2B enterprise"
→ Discover recent funding rounds
→ Generate email for investor relations
```

### Use Case 3: Monitor RFPs
```
Query: "federal RFP technology infrastructure"
→ Find new Request for Proposals
→ Generate email for sales team
```

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| No API key | Already filled in, but check the input field |
| Timeout error | Try a simpler query or wait 60 seconds |
| No results | Try broader search terms |
| Can't copy email | Click the textarea first, then copy button |

## What's Next?

After testing here, you can:
1. ✅ Verify the API works with your key
2. ✅ Test different queries
3. ✅ Review the API responses in debug mode
4. ✅ Use these learnings in the main Electron app

## Files in This Folder

```
yutori-standalone/
├── index.html       ← Main application
├── styles.css       ← All styling
├── app.js           ← Application logic
├── launch.sh        ← Quick launcher
├── README.md        ← Full documentation
└── QUICK_START.md   ← This file
```

## Need More Help?

- 📖 Full docs: See `README.md`
- 🌐 Yutori API: https://docs.yutori.com
- 💬 Issues: https://github.com/zpahuja/trailmix-meeting-ai/issues

---

**Ready to start? Run `./launch.sh` or open `index.html`!** 🎉
