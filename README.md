# DSEC-Lab Dark Web Monitoring & Threat Intelligence Platform

A modern dark web monitoring platform that allows users to search for exposed credentials by email address or domain.

## Features

- 🔍 **Search Functionality**: Enter an email address or domain to check for leaked credentials
- 🎨 **Modern UI/UX**: Dark-themed, minimalist design with smooth animations
- ⚡ **Fast API**: Built with FastAPI for high performance
- 🔒 **Real-time Monitoring**: Check for exposed credentials instantly
- 📊 **Detailed Results**: View breach sources, dates, and exposed data types

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS with dark theme and modern design

## Installation

1. Clone the repository:
```bash
cd dsec-lab
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the FastAPI server:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage

1. Enter an email address (e.g., `user@example.com`) or domain (e.g., `example.com`) in the search box
2. Click "Search" or press Enter
3. View the results showing any matched leaked credentials, including:
   - Email address
   - Breach source
   - Breach date
   - Types of exposed data

## API Endpoints

### POST `/api/search`
Search for leaked credentials.

**Request Body:**
```json
{
  "query": "user@example.com"
}
```

**Response:**
```json
{
  "query": "user@example.com",
  "query_type": "email",
  "matches_found": 3,
  "credentials": [
    {
      "email": "user@example.com",
      "password": "••••••••",
      "source": "LinkedIn 2012",
      "breach_date": "2012-05-05",
      "exposed_data": ["Email addresses", "Passwords", "Usernames"]
    }
  ],
  "timestamp": "2024-01-01T12:00:00"
}
```

### GET `/health`
Health check endpoint.

## Project Structure

```
dsec-lab/
├── app.py                 # FastAPI application
├── templates/
│   └── index.html        # Landing page HTML
├── static/
│   ├── css/
│   │   └── style.css     # Stylesheet
│   └── js/
│       └── main.js       # JavaScript functionality
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Development

The application uses mock data for demonstration purposes. In production, you would integrate with actual dark web monitoring databases and threat intelligence feeds.

## License

Copyright © 2024 DSEC-Lab. All rights reserved.

