# 🤖 AI-Powered Email Generation System

## Overview
Complete system for generating personalized, scheduled email timelines for each meeting participant using AI (Claude 3.7 Sonnet).

---

## ✨ Features

### 1. **Individual Contact Management**
- Each participant gets their own email timeline
- 6 personalized emails per contact
- Split by agenda and team membership

### 2. **Scheduled Email Timeline**
Each contact receives emails on this schedule:

| Email # | Type | Timing | Purpose |
|---------|------|--------|---------|
| 1 | Follow-up | Day 0 (immediate) | Thank them for attending |
| 2 | Action Items | Day 2 | Check on their specific tasks |
| 3 | Status Update | Day 7 (1 week) | Progress update |
| 4 | Reminder | Day 12 | Deadline approaching |
| 5 | Summary | Day 14 (2 weeks) | Comprehensive summary |
| 6 | Follow-up | Day 21 (3 weeks) | Long-term check-in |

### 3. **AI-Generated Content**
Using Claude 3.7 Sonnet, each email includes:
- **Personalized greeting** with participant's name
- **Meeting context** relevant to their role
- **Action items** specific to them
- **Professional tone** appropriate for business
- **Custom subject lines** (<60 characters)

### 4. **Preview Panel**
Before generating, see:
- ✅ Total contacts to process
- ✅ Total emails to generate (contacts × 6)
- ✅ Estimated generation time
- ✅ Each contact's email timeline with dates
- ✅ Expandable timeline view per contact

---

## 🎯 How to Use

### Step 1: Load Sample Data
1. Click **"Load Sample Data"** button
2. System loads 4 CSV files:
   - `meeting_logs.csv` - Meeting details
   - `meeting_participants.csv` - Attendees and roles
   - `scheduled_email_templates.csv` - Template definitions
   - `followups.csv` - Action items and tasks

### Step 2: Preview Contacts & Timeline
The **Email Timeline Preview** panel shows:
- All participants from all meetings
- Each participant's 6-email schedule with dates
- Total statistics at the top
- Click **"View Timeline"** on any contact to expand their schedule

### Step 3: Generate AI Emails
1. Click **"Generate All AI Emails"** button
2. System processes each contact:
   - Generates 6 unique emails using AI
   - Shows real-time progress
   - Updates display as emails are created
3. Wait for completion (est. 30 seconds per contact)

### Step 4: Review & Copy
- All generated emails displayed in email section
- Organized by contact and email number
- Each email shows:
  - Scheduled date
  - Recipient info
  - Email type
  - Full subject and body
- Click **"Copy All Emails"** to copy to clipboard

---

## 📊 Example Output

```
==========================================================================================
CONTACT: James Wilson (james.wilson@hotmail.com)
MEETING: Team Retro
ROLE: organizer | ATTENDANCE: attended
==========================================================================================

--- EMAIL 1/6: Immediate Follow-up ---
Scheduled: 2026-01-13 (0 days after meeting)
To: james.wilson@hotmail.com
Type: followup

Subject: Team Retro: Key Takeaways and Next Steps

Dear James,

Thank you for organizing and leading our Team Retro on January 13th. Your
facilitation created a productive environment for the team to reflect on our
recent sprint.

Key points from our discussion:
- Successfully delivered 8 of 10 planned features
- Identified process improvements for standup meetings
- Action items assigned to improve code review turnaround

Your specific action items:
- Set up demo environment for client (Due: Oct 27, High Priority)

I'll follow up in 2 days to check on progress. Please reach out if you need
any support with these items.

Best regards,
Meeting Coordinator

------------------------------------------------------------------------------------------

--- EMAIL 2/6: 2-Day Check-in ---
Scheduled: 2026-01-15 (2 days after meeting)
...

[5 more emails continue]
```

---

## 🔧 Technical Details

### Data Integration
Connects all 4 CSV files:
- Links participants to meetings via `meeting_id`
- Associates action items with contacts via `assigned_to`
- Uses email templates when available
- Falls back to AI generation

### AI Prompt Structure
For each email, AI receives:
```
Meeting Details:
- Title, Type, Date, Time, Location, Organizer

Participant:
- Name, Email, Role, Attendance Status

Action Items:
- Task, Assignee, Due Date, Priority, Status

Generate professional email with:
1. Subject line (<60 chars)
2. Personalized greeting
3. Meeting context for their role
4. Action items or key takeaways
5. Professional closing
```

### Performance
- **Per Contact**: ~30 seconds (6 emails)
- **10 Meetings**: ~30 contacts = ~15 minutes
- **Total Emails**: 30 contacts × 6 = 180 emails
- **Parallel Processing**: Can be optimized for batch generation

---

## 📁 Files Modified

### Backend
- **src/research-service.js**: AI email generation functions
  - `generateAIEmail()` - Single email with OpenAI
  - `generateEmailTimeline()` - 6 emails per contact
- **src/main.js**: IPC handler for `generateAIEmailTimeline`

### Frontend
- **src/index.html**: Contacts preview panel UI
- **src/index.css**: Contact cards, timeline items, stats
- **src/renderer.js**:
  - `displayContactsPreview()` - Show all contacts
  - `generateAllFollowupEmails()` - Process all contacts
- **src/preload.js**: Expose `generateAIEmailTimeline` API

---

## 🎨 UI Components

### Contacts Preview Panel
```
📧 Email Timeline Preview
[30 contacts] [180 emails to generate] [Est: 15 min]

┌─────────────────────────────────────────┐
│ James Wilson                      [View Timeline] │
│ 📧 james@email.com 👤 organizer 📅 attended        │
│ 🎯 Team Retro                                      │
│                                                     │
│ 6 Scheduled Emails:                                │
│ ┌───────────────────────────────────┐             │
│ │ 1. Immediate Follow-up  2026-01-13 │             │
│ │ followup                           │             │
│ └───────────────────────────────────┘             │
│ ┌───────────────────────────────────┐             │
│ │ 2. 2-Day Check-in      2026-01-15 │             │
│ │ action_items                       │             │
│ └───────────────────────────────────┘             │
│ ... (4 more)                                       │
└─────────────────────────────────────────┘

[Generate All AI Emails]
```

---

## 🚀 Next Steps

### Immediate
1. **Restart the app** to ensure IPC handler is registered
2. Click "Load Sample Data"
3. Review contacts in preview panel
4. Click "Generate All AI Emails"

### Future Enhancements
- ✨ Individual email generation (one contact at a time)
- ✨ Custom schedule adjustment per contact
- ✨ Email template selection
- ✨ Export to CSV or calendar
- ✨ Send emails directly via SMTP
- ✨ Track email open rates

---

## 🐛 Troubleshooting

### "No handler registered for generateAIEmailTimeline"
**Solution**: Restart the Electron app
```bash
# Stop the app, then:
npm start
```

### AI Generation Taking Too Long
- Each contact takes ~30 seconds for 6 emails
- Total time = contacts × 30 seconds
- Progress updates show in real-time

### OpenAI API Errors
- Check `OPENROUTER_KEY` in `.env`
- Verify internet connection
- Check OpenRouter API status

---

## 📞 Support

- View implementation: `src/research-service.js`
- Check IPC handlers: `src/main.js` (line 1852)
- See UI components: `src/index.html` (line 331)

**Ready to generate personalized AI emails for every contact! 🎯**
