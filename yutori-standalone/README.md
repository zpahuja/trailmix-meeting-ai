# Yutori API Standalone Test Suite

A standalone HTML/CSS/JS application for testing the Yutori API's B2G procurement research capabilities.

## Features

- ✅ **Scout Creation**: Create research scouts with custom queries
- ✅ **Real-time Polling**: Automatic polling with progress tracking
- ✅ **Results Display**: Beautiful card-based results layout
- ✅ **Email Generator**: Generate professional follow-up emails
- ✅ **Debug Logger**: View all API requests and responses
- ✅ **Responsive Design**: Works on desktop and mobile

## Quick Start

### 1. Open in Browser

Simply open `index.html` in any modern web browser:

```bash
# Using default browser
open index.html

# Or using Chrome
open -a "Google Chrome" index.html

# Or using Firefox
open -a "Firefox" index.html
```

### 2. Configure API Key

The API key is pre-filled, but you can change it:
```
yt_OBX6WEG1djjjqJb8VD_8lAem5vASpj-_dP27Y7TMr64
```

### 3. Run Research

1. Enter or modify the search query (default: "b2g procurement enterprise contract, fundraise news")
2. Click **"Start Research"**
3. Wait for results (typically 30-60 seconds)
4. View results in cards
5. Generate follow-up email
6. Copy email to clipboard

## File Structure

```
yutori-standalone/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling (responsive)
├── app.js          # Application logic and API integration
└── README.md       # This file
```

## API Integration

### Endpoints Used

1. **Create Scout**
   ```
   POST https://api.yutori.com/scouts
   ```
   Creates a new research scout with your query.

2. **Get Scout Details**
   ```
   GET https://api.yutori.com/scouts/{scout_id}
   ```
   Retrieves scout status and results.

### Request Example

**Create Scout:**
```json
{
  "query": "b2g procurement enterprise contract, fundraise news",
  "filters": {
    "categories": ["procurement", "contracts", "funding", "fundraising"]
  }
}
```

**Response:**
```json
{
  "scout_id": "abc123",
  "status": "pending",
  "created_at": "2026-01-16T12:00:00Z"
}
```

### Polling Logic

The application polls the scout details endpoint every 2 seconds for up to 30 attempts (60 seconds total):

```javascript
async function pollScoutResults(apiKey, scoutId, maxAttempts = 30, intervalMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const details = await getScoutDetails(apiKey, scoutId);

    if (details.status === 'completed') {
      return details;
    }

    if (details.status === 'failed') {
      throw new Error('Scout research failed');
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Research timed out');
}
```

## Features in Detail

### 1. Status Tracking

Real-time status updates showing:
- Current operation (creating scout, polling, completed)
- Attempt counter (e.g., "Attempt 5/30")
- Progress bar with animation
- Status badges (Active, Completed, Failed)

### 2. Results Display

Each result card shows:
- **Title**: Opportunity name
- **Description**: Brief summary
- **Meta Information**:
  - 💰 Contract value/amount
  - 📅 Deadline
  - 📍 Location (if available)
- **Link**: "Read more →" opens in new tab

### 3. Email Generation

Customizable email with:
- Recipient name
- Sender name
- Company name
- Professional format with:
  - Greeting
  - Summary of top 5 results
  - Links to opportunities
  - Call-to-action
  - Signature

### 4. Debug Logger

Shows all API interactions:
- Request details (URL, body, headers)
- Response data (formatted JSON)
- Timestamps
- Collapsible interface

## Customization

### Change API Base URL

Edit in `app.js`:
```javascript
const API_BASE = 'https://api.yutori.com';
```

### Adjust Polling Parameters

Edit in `app.js`:
```javascript
await pollScoutResults(
  apiKey,
  scoutId,
  maxAttempts = 30,    // Total attempts
  intervalMs = 2000     // Interval in milliseconds
);
```

### Modify Search Filters

Edit the `createScout` function in `app.js`:
```javascript
const body = {
  query: query,
  filters: {
    categories: ['procurement', 'contracts', 'funding', 'fundraising'],
    // Add more filters:
    // region: 'US',
    // industry: 'technology',
    // min_value: 100000
  }
};
```

### Customize Email Template

Edit the `generateEmail` function in `app.js` to change:
- Email structure
- Tone and language
- Content formatting
- Number of results included (default: 5)

## Styling

### Color Scheme

The app uses a purple gradient theme:
```css
:root {
  --primary: #6947BD;
  --primary-dark: #5838A5;
  --secondary: #0077FF;
  --success: #4CAF50;
  --danger: #F44336;
  --warning: #FF9800;
}
```

### Responsive Breakpoints

- Desktop: > 768px
- Mobile: ≤ 768px

### Animations

- Slide-in alerts
- Button hover effects
- Progress bar animation
- Card hover transforms

## Troubleshooting

### Issue: "Please enter your Yutori API key"

**Solution**: Make sure the API key field is filled in and not empty.

### Issue: "Research timed out after 60 seconds"

**Solutions**:
1. Try a simpler query
2. Increase `maxAttempts` in `app.js`
3. Check your internet connection
4. Verify the Yutori API is operational

### Issue: No results found

**Possible causes**:
1. Query is too specific
2. No matching data in Yutori's database
3. API returned empty results

**Solutions**:
- Try broader search terms
- Check the debug logger for API responses
- Verify filter categories

### Issue: CORS errors in browser console

**Solution**: This is a browser security feature. The Yutori API must have CORS enabled for browser requests. If you encounter CORS issues, contact Yutori support or use a CORS proxy for testing.

### Issue: API returns 401 Unauthorized

**Solution**:
- Verify your API key is correct
- Check if the API key has expired
- Ensure the key has proper permissions

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## No Dependencies

This is a pure HTML/CSS/JavaScript application with:
- ❌ No npm packages
- ❌ No build process
- ❌ No frameworks
- ✅ Just open and run!

## API Documentation

For full Yutori API documentation:
- **Scouts Create**: https://docs.yutori.com/reference/scouts-create
- **Scout Get Detail**: https://docs.yutori.com/reference/scout-get-detail

## License

This test suite is part of the Trailmix Meeting AI project.

## Support

For issues:
- GitHub: https://github.com/zpahuja/trailmix-meeting-ai/issues
- Yutori API: https://docs.yutori.com

---

**Happy Testing! 🚀**
