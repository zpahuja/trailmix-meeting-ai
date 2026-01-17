# Sector-Specific Query Examples

## How It Works

When users enter a sector-specific query, the Tinyfish (Mino.ai) agent receives a **detailed, customized prompt** that instructs it to:
1. Search SAM.gov for opportunities in that sector
2. Extract comprehensive contract details
3. Return structured data in JSON format
4. Focus only on ACTIVE opportunities
5. Find 5-10 relevant results

---

## Query Examples by Sector

### 🔐 **Cybersecurity**

**User Query:**
```
cybersecurity defense government
```

**What the Agent Does:**
- Searches SAM.gov for cybersecurity-related contracts
- Looks for keywords: security, cyber, defense, protection, threat
- Extracts: contract name, value, deadline, contact, agency
- Filters for active government opportunities

**Expected Results:**
- DoD Cybersecurity Infrastructure
- Federal Network Protection Services
- CISA Threat Detection Systems
- DHS Security Operations Center
- FBI Cyber Forensics Tools

---

### 🏥 **Healthcare**

**User Query:**
```
healthcare AI medical technology
```

**What the Agent Does:**
- Searches SAM.gov for healthcare/medical contracts
- Looks for: healthcare, medical, health IT, telemedicine, EHR
- Focuses on technology and AI solutions
- Extracts full contract details

**Expected Results:**
- VA Electronic Health Records Modernization
- HHS Telemedicine Platform Development
- CDC Data Analytics Systems
- Medicare Claims Processing AI
- DoD Medical Logistics Software

---

### ☁️ **Cloud Computing**

**User Query:**
```
cloud computing infrastructure AWS
```

**What the Agent Does:**
- Searches for cloud infrastructure contracts
- Keywords: cloud, AWS, Azure, infrastructure, IaaS, PaaS
- Looks for government cloud migrations
- Extracts size of bid and technical requirements

**Expected Results:**
- GSA Cloud Migration Services
- Defense Cloud Computing Platform
- Federal Cloud Email Services
- NASA Cloud Storage Solutions
- IRS Cloud Infrastructure Upgrade

---

### 🤖 **Artificial Intelligence**

**User Query:**
```
artificial intelligence machine learning
```

**What the Agent Does:**
- Searches for AI/ML government contracts
- Keywords: AI, machine learning, neural networks, data science
- Finds research and deployment opportunities
- Extracts NAICS codes for AI services

**Expected Results:**
- DoD AI Decision Support Systems
- VA Predictive Analytics Platform
- FBI Criminal Pattern Recognition AI
- USDA Agricultural AI Research
- DOE Energy Optimization ML

---

### 🚀 **Aerospace & Defense**

**User Query:**
```
aerospace defense systems
```

**What the Agent Does:**
- Searches defense and aerospace contracts
- Keywords: aerospace, defense, military, systems
- Looks for R&D and procurement opportunities
- Extracts set-aside information (Small Business, etc.)

**Expected Results:**
- Air Force Next-Gen Fighter Systems
- NASA Space Launch Services
- Navy Unmanned Systems
- Army Communications Equipment
- Space Force Satellite Operations

---

### 🏛️ **Government IT Modernization**

**User Query:**
```
IT modernization legacy systems
```

**What the Agent Does:**
- Searches for IT modernization contracts
- Keywords: modernization, legacy, upgrade, digital transformation
- Finds infrastructure and software updates
- Extracts agency names and deadlines

**Expected Results:**
- Social Security IT Modernization
- USPS Mail Processing Systems Upgrade
- IRS Tax System Modernization
- DHS Border Systems Integration
- State Department Legacy Migration

---

### 📊 **Data Analytics**

**User Query:**
```
data analytics business intelligence
```

**What the Agent Does:**
- Searches for data and analytics contracts
- Keywords: data, analytics, BI, reporting, visualization
- Looks for decision support systems
- Extracts contract values

**Expected Results:**
- Census Bureau Data Processing
- HHS Public Health Analytics
- DOT Traffic Data Analysis
- EPA Environmental Monitoring Data
- Education Department Student Analytics

---

### 🌐 **Telecommunications**

**User Query:**
```
telecommunications network infrastructure
```

**What the Agent Does:**
- Searches telecom and network contracts
- Keywords: telecommunications, network, 5G, connectivity
- Finds infrastructure buildout opportunities
- Extracts technical specifications

**Expected Results:**
- Rural Broadband Initiative
- Federal Building Network Upgrades
- Military Communications Systems
- Emergency Response Networks
- Smart City Infrastructure

---

### 🔬 **Research & Development**

**User Query:**
```
research development innovation grants
```

**What the Agent Does:**
- Searches R&D contracts and grants
- Keywords: research, development, innovation, SBIR, STTR
- Finds funding opportunities
- Extracts grant amounts and deadlines

**Expected Results:**
- NSF Research Grants
- DARPA Innovation Programs
- NIH Medical Research
- DOE Energy Research
- NASA Technology Development

---

### 🏗️ **Construction & Infrastructure**

**User Query:**
```
construction infrastructure federal buildings
```

**What the Agent Does:**
- Searches construction contracts
- Keywords: construction, infrastructure, building, facilities
- Looks for federal building projects
- Extracts project sizes and locations

**Expected Results:**
- GSA Federal Building Renovation
- DoD Military Base Construction
- VA Hospital Construction
- Federal Highway Projects
- Airport Infrastructure Upgrades

---

## Advanced Query Techniques

### Combine Multiple Keywords
```
cybersecurity + healthcare
→ Healthcare cybersecurity solutions
```

### Specify Government Agency
```
DoD cloud computing
→ Department of Defense cloud contracts
```

### Include Budget Range
```
small business IT contracts under $10M
→ Small business set-aside opportunities
```

### Geographic Focus
```
California infrastructure projects
→ State-specific opportunities
```

### Technology Stack
```
React Node.js web development
→ Specific technology requirements
```

---

## Goal Prompt Template

For any query, the agent receives this detailed instruction:

```
You are searching SAM.gov for B2G procurement opportunities.

USER'S SECTOR/QUERY: "{user's input}"

TASK:
1. Navigate to https://sam.gov/search
2. Search for opportunities related to: {user's input}
3. For EACH opportunity found, extract:
   - Contract Name (required)
   - Detail URL (required)
   - Contract Value / Size of Bid (if available)
   - Contact Email (if available)
   - Deadline / Due Date (if available)
   - Description / Synopsis (if available)
   - Agency Name (if available)
   - NAICS Code (if available)
   - Set-Aside Type (if available)

4. Return as JSON array with these fields:
   {
     "name": "string",
     "detail_url": "string",
     "size_of_bid": "string",
     "contact_email": "string",
     "deadline": "string",
     "description": "string",
     "agency": "string",
     "naics_code": "string",
     "set_aside": "string"
   }

5. Find 5-10 relevant opportunities
6. Focus on ACTIVE opportunities only
7. Use sector-specific keywords and filters

IMPORTANT: Return ONLY opportunities matching: "{user's input}"
```

---

## Data Normalization

The agent handles various field name variations:

| Standard Field | Alternative Names |
|---------------|-------------------|
| `title` | name, contract_name, opportunity_name |
| `description` | details, summary, synopsis |
| `url` | detail_url, link, opportunity_url |
| `amount` | size_of_bid, contract_value, value, dollar_amount |
| `deadline` | due_date, closing_date, response_date |
| `contact_email` | email, contact, poc_email |
| `agency` | department, agency_name |

---

## Best Practices

### ✅ **Good Queries:**
- Specific sector: "healthcare AI"
- Technology focus: "cloud AWS government"
- Agency + sector: "DoD cybersecurity"
- Budget conscious: "small business IT"

### ❌ **Avoid:**
- Too vague: "contracts"
- Too narrow: "specific RFP number"
- Non-government: "commercial sales"
- Expired: "2020 opportunities"

---

## Testing Different Sectors

Try these in the UI:

1. **"cybersecurity defense"** - Security contracts
2. **"healthcare AI"** - Medical technology
3. **"cloud computing AWS"** - Cloud infrastructure
4. **"data analytics"** - Analytics and BI
5. **"IT modernization"** - Legacy system upgrades
6. **"renewable energy"** - Green energy projects
7. **"small business software"** - SMB opportunities
8. **"research grants"** - R&D funding

---

## Example Output

When you search for **"cybersecurity defense government"**:

```json
{
  "title": "DoD Cybersecurity Operations Center",
  "description": "24/7 security monitoring and incident response...",
  "url": "https://sam.gov/opp/12345",
  "amount": "$8.5M",
  "deadline": "2026-03-15",
  "contact_email": "contracts@dod.mil",
  "agency": "Department of Defense",
  "naics_code": "541512",
  "set_aside": "Small Business",
  "source": "SAM.gov"
}
```

---

## How to Use

1. **Open the research panel** in the app
2. **Enter your sector query** (e.g., "healthcare AI")
3. **Click "Start Research"**
4. **Watch real-time progress** as agent searches
5. **Review results** with full contract details
6. **Generate follow-up email** with one click

The more specific your query, the better the results! 🎯
