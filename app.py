from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel, EmailStr
import re
from typing import List, Optional
from datetime import datetime
import random

app = FastAPI(title="DSEC-Lab Dark Web Monitoring", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


class SearchRequest(BaseModel):
    query: str


class LeakedCredential(BaseModel):
    email: str
    password: Optional[str] = None
    source: str
    breach_date: str
    exposed_data: List[str]


class SearchResponse(BaseModel):
    query: str
    query_type: str  # "email" or "domain"
    matches_found: int
    credentials: List[LeakedCredential]
    timestamp: str


# Mock data generator for demonstration
def generate_mock_credentials(query: str, query_type: str) -> List[LeakedCredential]:
    """Generate mock leaked credentials for demonstration purposes"""
    credentials = []
    
    # Generate 20 mock credentials for demonstration
    num_results = 20
    sources = ["LinkedIn 2012", "Adobe 2013", "Yahoo 2013", "Dropbox 2012", 
              "MySpace 2008", "Equifax 2017", "Facebook 2019", "Marriott 2018",
              "Capital One 2019", "T-Mobile 2021", "SolarWinds 2020", "Colonial Pipeline 2021"]
    dates = ["2012-05-05", "2013-10-03", "2013-12-14", "2012-07-19", 
            "2008-06-11", "2017-09-07", "2019-04-14", "2018-11-30",
            "2019-07-29", "2021-08-15", "2020-12-13", "2021-05-07"]
    
    if query_type == "email":
        # Generate 20 mock credentials for email
        for i in range(num_results):
            source = random.choice(sources)
            date = random.choice(dates)
            exposed = random.sample([
                "Email addresses", "Passwords", "Usernames", "Phone numbers", 
                "Credit cards", "SSN", "Stealer logs", "Infostealer data", 
                "Malware samples", "Phishing credentials", "RedLine stealer", 
                "Raccoon stealer", "Lumma stealer"
            ], random.randint(2, 4))
            
            credentials.append(LeakedCredential(
                email=query,
                password="••••••••" if random.random() > 0.3 else None,
                source=source,
                breach_date=date,
                exposed_data=exposed
            ))
    else:  # domain
        # Generate 20 mock credentials for domain
        for i in range(num_results):
            username = f"user{random.randint(1, 1000)}"
            email = f"{username}@{query}"
            source = random.choice(sources)
            date = random.choice(dates)
            exposed = random.sample([
                "Email addresses", "Passwords", "Usernames", "Phone numbers", 
                "Names", "Credit cards", "Stealer logs", "Infostealer data", 
                "Malware samples", "Phishing credentials", "RedLine stealer", 
                "Raccoon stealer", "Lumma stealer"
            ], random.randint(1, 3))
            
            credentials.append(LeakedCredential(
                email=email,
                password="••••••••" if random.random() > 0.2 else None,
                source=source,
                breach_date=date,
                exposed_data=exposed
            ))
    
    return credentials


def detect_query_type(query: str) -> str:
    """Detect if query is an email or domain"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(email_pattern, query):
        return "email"
    else:
        # Assume it's a domain (basic validation)
        domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
        if re.match(domain_pattern, query):
            return "domain"
        else:
            return "domain"  # Default to domain for invalid input


@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the landing page"""
    return FileResponse("templates/index.html")


@app.get("/horizons", response_class=HTMLResponse)
async def horizons_page():
    """Serve the horizons page"""
    return FileResponse("templates/horizons.html")


@app.get("/faq", response_class=HTMLResponse)
async def faq_page():
    """Serve the FAQ page"""
    return FileResponse("templates/faq.html")


@app.get("/features", response_class=HTMLResponse)
async def features_page():
    """Serve the features page"""
    return FileResponse("templates/features.html")


@app.get("/benefits", response_class=HTMLResponse)
async def benefits_page():
    """Serve the benefits page"""
    return FileResponse("templates/benefits.html")


@app.post("/api/search", response_model=SearchResponse)
async def search_credentials(request: SearchRequest):
    """
    Search for leaked credentials by email or domain
    """
    query = request.query.strip()
    
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    query_type = detect_query_type(query)
    
    # Generate mock credentials (in production, this would query a real database)
    credentials = generate_mock_credentials(query, query_type)
    
    return SearchResponse(
        query=query,
        query_type=query_type,
        matches_found=len(credentials),
        credentials=credentials,
        timestamp=datetime.now().isoformat()
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "dsec-lab-dark-web-monitoring"}

