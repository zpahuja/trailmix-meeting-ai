# 🚀 Quick Reference - B2G Research Feature

## How to Use

### 1. Open the Research Panel
```
Click "B2G Research" button in header
```

### 2. Enter Sector Query
Examples:
- `cybersecurity defense government`
- `healthcare AI medical`
- `cloud AWS infrastructure`
- `data analytics`
- `IT modernization`

### 3. Start Research
```
Click "Start Research" → Watch real-time progress
```

### 4. View Results
- 5-10 opportunities displayed as cards
- Each with: title, description, value, deadline, contact, URL

### 5. Generate Email
```
Click "Generate Follow-up Email"
Customize: recipient, sender, company
Click "Copy Email"
```

---

## Popular Sector Queries

| Query | What You'll Find |
|-------|-----------------|
| `cybersecurity defense` | DoD, CISA, DHS security contracts |
| `healthcare AI` | VA, HHS medical tech opportunities |
| `cloud computing` | Federal cloud migration contracts |
| `data analytics` | Government data processing contracts |
| `IT modernization` | Legacy system upgrade projects |
| `aerospace defense` | Military and space contracts |
| `small business IT` | SMB set-aside opportunities |

---

## Technical Details

### API Endpoint
```
POST https://mino.ai/v1/automation/run-sse
```

### API Key
```bash
MINO_API_KEY=sk-mino-cWSgb9FXhPNiKvUzX-1M-QGt_sFUbV8s
```

### Data Extracted
1. Contract Name ✓
2. Detail URL ✓
3. Dollar Amount ✓
4. Contact Email ✓
5. Deadline ✓
6. Description ✓
7. Agency ✓
8. NAICS Code ✓
9. Set-Aside Type ✓

---

## Files

### Main Implementation
- **[src/research-service.js](src/research-service.js)** - Core logic
- **[src/main.js](src/main.js)** - IPC handlers
- **[src/preload.js](src/preload.js)** - API bridge
- **[src/renderer.js](src/renderer.js)** - UI logic
- **[src/index.html](src/index.html)** - UI panel
- **[src/index.css](src/index.css)** - Styles

### Documentation
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Complete overview
- **[SECTOR_QUERIES.md](SECTOR_QUERIES.md)** - Query examples
- **[MINO_INTEGRATION.md](MINO_INTEGRATION.md)** - Technical details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - This file

---

## Testing

### Run the App
```bash
npm start
```

### Test Script
```bash
cd yutori-standalone
node mino-test.js "cybersecurity"
```

---

## Troubleshooting

### No Results?
- Try broader query: "healthcare" instead of "pediatric oncology"
- Check SAM.gov directly to verify opportunities exist
- Wait longer (can take 30-60 seconds)

### Streaming Not Working?
- Check internet connection
- Verify API key in `.env`
- Look at console for errors

### Email Not Generating?
- Ensure results were found first
- Check browser console for errors
- Try refreshing the page

---

## Support

- **Mino.ai:** https://docs.mino.ai
- **SAM.gov:** https://sam.gov
- **Issues:** https://github.com/zpahuja/trailmix-meeting-ai/issues

---

**Ready to find B2G opportunities? Start searching! 🎯**
