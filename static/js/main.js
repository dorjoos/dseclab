// DOM Elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const resultsCount = document.getElementById('resultsCount');
const resultsQuery = document.getElementById('resultsQuery');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const paginationNumbers = document.getElementById('paginationNumbers');
const paginationInfo = document.getElementById('paginationInfo');

// Pagination state
let currentPage = 1;
let itemsPerPage = 10;
let allCredentials = [];

// API Base URL
const API_BASE_URL = '/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Form submission handler
    searchForm.addEventListener('submit', handleSearch);
    
    // Enter key handler
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    });
    
    // Add scroll animations
    initScrollAnimations();
    
    // Add network node connections animation
    animateNetworkNodes();
    
    // Add parallax effect to background
    initParallax();
    
    // Pagination event listeners
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allCredentials.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
});

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe table rows for animations
    document.querySelectorAll('.results-table tbody tr').forEach(row => {
        observer.observe(row);
    });
}

/**
 * Animate network nodes with floating effect
 */
function animateNetworkNodes() {
    // Animation is handled by CSS
    // This function can be used for additional interactive effects if needed
}

/**
 * Initialize parallax effect
 */
function initParallax() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const glowCircle = document.querySelector('.glow-circle');
                const connectionLines = document.querySelector('.connection-lines');
                
                if (glowCircle) {
                    glowCircle.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.3}px))`;
                }
                
                if (connectionLines) {
                    connectionLines.style.transform = `translateY(${scrolled * 0.1}px)`;
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

/**
 * Handle search form submission
 */
async function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter an email address or domain');
        return;
    }
    
    // Validate input
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(query) && !domainPattern.test(query)) {
        showError('Please enter a valid email address or domain');
        return;
    }
    
    // Hide previous results and errors
    hideAllStates();
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Search failed');
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'An error occurred while searching. Please try again.');
    }
}

/**
 * Display search results
 */
function displayResults(data) {
    hideAllStates();
    
    if (data.matches_found === 0) {
        showNoResults(data.query);
        return;
    }
    
    // Update results header
    resultsCount.textContent = data.matches_found;
    resultsQuery.textContent = `Search results for: ${data.query} (${data.query_type})`;
    
    // Store all credentials and reset pagination
    allCredentials = data.credentials;
    currentPage = 1;
    
    // Render table with pagination
    renderTable();
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Render table with current page data
 */
function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allCredentials.slice(startIndex, endIndex);
    
    // Clear table body
    resultsTableBody.innerHTML = '';
    
    if (pageData.length === 0) {
        resultsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No results found
                </td>
            </tr>
        `;
    } else {
        pageData.forEach((credential, index) => {
            const row = createTableRow(credential);
            row.style.animationDelay = `${index * 0.05}s`;
            resultsTableBody.appendChild(row);
        });
    }
    
    // Update pagination
    updatePagination();
}

/**
 * Create a table row element
 */
function createTableRow(credential) {
    const row = document.createElement('tr');
    
    const exposedTags = credential.exposed_data
        .map(data => {
            const category = getDataCategory(data);
            return `<span class="exposed-tag exposed-tag-${category}">${escapeHtml(data)}</span>`;
        })
        .join('');
    
    row.innerHTML = `
        <td class="email-cell">${escapeHtml(credential.email)}</td>
        <td>${formatDate(credential.breach_date)}</td>
        <td>${credential.password ? escapeHtml(credential.password) : '<span style="color: var(--text-muted);">—</span>'}</td>
        <td class="exposed-cell">${exposedTags}</td>
        <td class="action-cell">
            <button class="btn-view" data-email="${escapeHtml(credential.email)}" data-source="${escapeHtml(credential.source)}">
                <span>View</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2L2 7l5 5 5-5-5-5z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalPages = Math.ceil(allCredentials.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, allCredentials.length);
    
    // Update pagination info
    paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${allCredentials.length}`;
    
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Update page numbers
    paginationNumbers.innerHTML = '';
    
    if (totalPages <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createPageButton(i, i === currentPage);
            paginationNumbers.appendChild(pageBtn);
        }
    } else {
        // Show first, last, and pages around current
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                paginationNumbers.appendChild(createPageButton(i, i === currentPage));
            }
            paginationNumbers.appendChild(createEllipsis());
            paginationNumbers.appendChild(createPageButton(totalPages, false));
        } else if (currentPage >= totalPages - 2) {
            paginationNumbers.appendChild(createPageButton(1, false));
            paginationNumbers.appendChild(createEllipsis());
            for (let i = totalPages - 3; i <= totalPages; i++) {
                paginationNumbers.appendChild(createPageButton(i, i === currentPage));
            }
        } else {
            paginationNumbers.appendChild(createPageButton(1, false));
            paginationNumbers.appendChild(createEllipsis());
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                paginationNumbers.appendChild(createPageButton(i, i === currentPage));
            }
            paginationNumbers.appendChild(createEllipsis());
            paginationNumbers.appendChild(createPageButton(totalPages, false));
        }
    }
}

/**
 * Create a page number button
 */
function createPageButton(page, isActive) {
    const button = document.createElement('button');
    button.className = `page-number ${isActive ? 'active' : ''}`;
    button.textContent = page;
    button.addEventListener('click', () => {
        currentPage = page;
        renderTable();
    });
    return button;
}

/**
 * Create ellipsis element
 */
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    return ellipsis;
}

/**
 * Show loading state
 */
function showLoading() {
    hideAllStates();
    loadingState.classList.remove('hidden');
}

/**
 * Show error state
 */
function showError(message) {
    hideAllStates();
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

/**
 * Show no results message
 */
function showNoResults(query) {
    hideAllStates();
    resultsCount.textContent = '0';
    resultsQuery.textContent = `No results found for: ${query}`;
    resultsTableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 48px;">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin: 0 auto 16px; opacity: 0.5;">
                    <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
                    <path d="M32 20v16M32 44h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p style="color: var(--text-secondary); font-size: 18px; margin-bottom: 8px;">
                    No leaked credentials found for this ${query.includes('@') ? 'email address' : 'domain'}.
                </p>
                <p style="color: var(--text-muted); font-size: 14px;">
                    This is good news! However, continue monitoring to stay protected.
                </p>
            </td>
        </tr>
    `;
    paginationInfo.textContent = 'Showing 0-0 of 0';
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    paginationNumbers.innerHTML = '';
    resultsSection.classList.remove('hidden');
}

/**
 * Hide all states
 */
function hideAllStates() {
    resultsSection.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date string
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    } catch (e) {
        return dateString;
    }
}

/**
 * Get category for exposed data tag
 */
function getDataCategory(data) {
    const lower = data.toLowerCase();
    if (lower.includes('stealer') || lower.includes('infostealer') || lower.includes('redline') || lower.includes('raccoon') || lower.includes('lumma')) {
        return 'stealer';
    } else if (lower.includes('malware') || lower.includes('virus') || lower.includes('trojan')) {
        return 'malware';
    } else if (lower.includes('phishing') || lower.includes('spoof')) {
        return 'phishing';
    } else if (lower.includes('password')) {
        return 'password';
    } else if (lower.includes('credit') || lower.includes('card')) {
        return 'financial';
    } else if (lower.includes('ssn') || lower.includes('social security')) {
        return 'identity';
    } else {
        return 'default';
    }
}

/**
 * Initialize FAQ accordion functionality
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Initialize FAQ when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
} else {
    initFAQ();
}

/**
 * Initialize progress bar based on scroll position
 */
function initProgressBar() {
    const progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars.length === 0) return;
    
    const progressBarCount = progressBars.length;
    
    function updateProgressBar() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        // Calculate how many bars should be active based on scroll percentage
        const activeBars = Math.ceil((scrollPercentage / 100) * progressBarCount);
        
        // Update progress bars
        progressBars.forEach((bar, index) => {
            if (index < activeBars) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateProgressBar();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgressBar(); // Initial call
}

// Initialize progress bar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressBar);
} else {
    initProgressBar();
}

/**
 * Initialize view button handlers
 */
function initViewButtons() {
    // Use event delegation for dynamically added buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-view')) {
            const button = e.target.closest('.btn-view');
            const email = button.getAttribute('data-email');
            const source = button.getAttribute('data-source');
            
            // Show alert with credential details (can be replaced with modal)
            alert(`Email: ${email}\nSource: ${source}\n\nView full details coming soon...`);
        }
    });
}

// Initialize view buttons
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewButtons);
} else {
    initViewButtons();
}

