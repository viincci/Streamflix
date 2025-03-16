// Global Variables
let currentPage = 1;
let currentCategory = 'all';
let currentSort = 'popularity';
let currentGenre = 'all';
let isLoggedIn = false;
let currentUser = null;
let favorites = [];
let contentData = [];

// DOM Elements
const contentGrid = document.getElementById('content-grid');
const featuredContent = document.getElementById('featured-content');
const loadMoreBtn = document.getElementById('load-more-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sortFilter = document.getElementById('sort-filter');
const genreFilter = document.getElementById('genre-filter');
const contentTitle = document.getElementById('content-title');
const loadingSpinner = document.getElementById('loading-spinner');
const navLinks = document.querySelectorAll('.nav-links a');
const detailModal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeLoginModal = document.querySelector('.close-login-modal');
const closeRegisterModal = document.querySelector('.close-register-modal');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const profileBtn = document.getElementById('profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    checkLoggedInStatus();
});

// Initialize the application
function initApp() {
    loadFeaturedContent();
    loadContent();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(el => el.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.getAttribute('data-category');
            currentPage = 1;
            
            if (currentCategory === 'favorites' && !isLoggedIn) {
                showLoginModal();
                return;
            }
            
            updateContentTitle();
            contentGrid.innerHTML = '';
            loadContent();
        });
    });

    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadContent(true);
    });

    // Search functionality
    searchButton.addEventListener('click', () => {
        handleSearch();
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filters
    sortFilter.addEventListener('change', () => {
        currentSort = sortFilter.value;
        currentPage = 1;
        contentGrid.innerHTML = '';
        loadContent();
    });

    genreFilter.addEventListener('change', () => {
        currentGenre = genreFilter.value;
        currentPage = 1;
        contentGrid.innerHTML = '';
        loadContent();
    });

    // Modal close buttons
    closeModal.addEventListener('click', () => {
        detailModal.style.display = 'none';
    });

    closeLoginModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    closeRegisterModal.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.style.display = 'none';
        }
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Login/Register buttons
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });

    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        showRegisterModal();
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        showLoginModal();
    });

    // Logout button
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Form submissions
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });
}

// Load featured content
async function loadFeaturedContent() {
    showLoader();
    try {
        const data = await fetchFeaturedContent();
        renderFeaturedContent(data);
    } catch (error) {
        console.error('Error loading featured content:', error);
        showNotification('Failed to load featured content', 'error');
    } finally {
        hideLoader();
    }
}

// Render featured content
function renderFeaturedContent(data) {
    featuredContent.innerHTML = '';
    
    data.forEach(item => {
        const isFavorite = favorites.some(fav => fav.id === item.id);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'featured-item';
        itemElement.setAttribute('data-id', item.id);
        
        itemElement.innerHTML = `
            <div class="favorite-icon ${isFavorite ? 'active' : ''}">
                <i class="fas fa-heart"></i>
            </div>
            <img src="${item.poster}" alt="${item.title}">
            <div class="featured-info">
                <div class="featured-title">${item.title}</div>
                <div class="featured-meta">
                    <span>${item.year}</span>
                    <span class="featured-rating"><i class="fas fa-star"></i> ${item.rating}</span>
                </div>
            </div>
        `;
        
        itemElement.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-icon')) {
                e.stopPropagation();
                toggleFavorite(item);
                return;
            }
            
            showContentDetails(item.id);
        });
        
        featuredContent.appendChild(itemElement);
    });
}

// Load content
async function loadContent(append = false) {
    showLoader();
    try {
        const data = await fetchContent(currentCategory, currentPage, currentSort, currentGenre);
        
        contentData = append ? [...contentData, ...data] : data;
        
        if (!append) {
            contentGrid.innerHTML = '';
        }
        
        renderContent(data);
        
        if (data.length < 20) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showNotification('Failed to load content', 'error');
    } finally {
        hideLoader();
    }
}

// Render content
function renderContent(data) {
    data.forEach(item => {
        const isFavorite = favorites.some(fav => fav.id === item.id);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'content-item';
        itemElement.setAttribute('data-id', item.id);
        
        itemElement.innerHTML = `
            <div class="favorite-icon ${isFavorite ? 'active' : ''}">
                <i class="fas fa-heart"></i>
            </div>
            <img src="${item.poster}" alt="${item.title}">
            <div class="content-info">
                <div class="content-title">${item.title}</div>
                <div class="content-meta">
                    <span>${item.year}</span>
                    <span class="content-rating"><i class="fas fa-star"></i> ${item.rating}</span>
                </div>
            </div>
        `;
        
        itemElement.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-icon')) {
                e.stopPropagation();
                toggleFavorite(item);
                return;
            }
            
            showContentDetails(item.id);
        });
        
        contentGrid.appendChild(itemElement);
    });
}

// Update content title
function updateContentTitle() {
    let title;
    
    switch (currentCategory) {
        case 'movies':
            title = 'Movies';
            break;
        case 'series':
            title = 'TV Series';
            break;
        case 'trending':
            title = 'Trending Now';
            break;
        case 'favorites':
            title = 'My Favorites';
            break;
        case 'search':
            title = `Search Results for "${searchInput.value}"`;
            break;
        default:
            title = 'Popular Now';
    }
    
    contentTitle.textContent = title;
}

// Show content details
async function showContentDetails(id) {
    showLoader();
    try {
        const item = await fetchContentDetails(id);
        
        const isFavorite = favorites.some(fav => fav.id === item.id);
        
        modalBody.innerHTML = `
            <div class="movie-detail">
                <div class="movie-poster">
                    <img src="${item.poster}" alt="${item.title}">
                </div>
                <div class="movie-info">
                    <h2 class="movie-title">${item.title}</h2>
                    <div class="movie-meta">
                        <span>${item.year}</span>
                        <span>${item.duration}</span>
                        <span>${item.type}</span>
                        ${item.genres.map(genre => `<span>${genre}</span>`).join('')}
                        <span class="movie-rating"><i class="fas fa-star"></i> ${item.rating}</span>
                    </div>
                    <p class="movie-description">${item.description}</p>
                    <div class="movie-cast">
                        <h3>Cast</h3>
                        <div class="cast-list">
                            ${item.cast.map(actor => `
                                <div class="cast-item">
                                    <img src="${actor.image || '/api/placeholder/80/80'}" alt="${actor.name}">
                                    <span>${actor.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="watch-options">
                        <button class="watch-button">Watch Now</button>
                        <button class="trailer-button">Watch Trailer</button>
                        <button class="favorite-button ${isFavorite ? 'active' : ''}">
                            <i class="fas fa-heart"></i> ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for favorite button
        const favoriteButton = modalBody.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', () => {
            toggleFavorite(item);
            const isNowFavorite = favorites.some(fav => fav.id === item.id);
            favoriteButton.classList.toggle('active', isNowFavorite);
            favoriteButton.innerHTML = `<i class="fas fa-heart"></i> ${isNowFavorite ? 'Remove from Favorites' : 'Add to Favorites'}`;
        });
        
        detailModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching content details:', error);
        showNotification('Failed to load content details', 'error');
    } finally {
        hideLoader();
    }
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 2) {
        showNotification('Please enter at least 2 characters to search', 'warning');
        return;
    }
    
    currentCategory = 'search';
    currentPage = 1;
    updateContentTitle();
    contentGrid.innerHTML = '';
    loadSearchResults(searchTerm);
}

// Load search results
async function loadSearchResults(searchTerm) {
    showLoader();
    try {
        const data = await searchContent(searchTerm);
        
        contentData = data;
        
        if (data.length === 0) {
            contentGrid.innerHTML = `<div class="no-results">No results found for "${searchTerm}"</div>`;
            loadMoreBtn.style.display = 'none';
        } else {
            renderContent(data);
            loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching content:', error);
        showNotification('Failed to search content', 'error');
    } finally {
        hideLoader();
    }
}

// Toggle favorite
function toggleFavorite(item) {
    if (!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    const index = favorites.findIndex(fav => fav.id === item.id);
    
    if (index === -1) {
        favorites.push(item);
        showNotification('Added to favorites', 'success');
    } else {
        favorites.splice(index, 1);
        showNotification('Removed from favorites', 'success');
    }
    
    updateFavoriteIcons(item.id);
    
    if (currentCategory === 'favorites') {
        contentGrid.innerHTML = '';
        renderContent(favorites);
    }
    
    saveFavoritesToDb();
}

// Update favorite icons
function updateFavoriteIcons(id) {
    const isFavorite = favorites.some(fav => fav.id === id);
    
    // Update in content grid
    const contentItems = document.querySelectorAll(`.content-item[data-id="${id}"] .favorite-icon`);
    contentItems.forEach(icon => {
        icon.classList.toggle('active', isFavorite);
    });
    
    // Update in featured content
    const featuredItems = document.querySelectorAll(`.featured-item[data-id="${id}"] .favorite-icon`);
    featuredItems.forEach(icon => {
        icon.classList.toggle('active', isFavorite);
    });
}

// Show login modal
function showLoginModal() {
    loginModal.style.display = 'block';
}

// Show register modal
function showRegisterModal() {
    registerModal.style.display = 'block';
}

// Handle login
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    showLoader();
    try {
        const user = await login(username, password);
        
        if (user) {
            isLoggedIn = true;
            currentUser = user;
            favorites = await getFavorites(user.id);
            
            loginModal.style.display = 'none';
            updateUIForLoggedIn();
            showNotification('Login successful', 'success');
            
            // Refresh content to update favorites
            if (currentCategory !== 'search') {
                contentGrid.innerHTML = '';
                loadContent();
            }
        } else {
            showNotification('Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed', 'error');
    } finally {
        hideLoader();
    }
}

// Handle register
async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'warning');
        return;
    }
    
    showLoader();
    try {
        const user = await register(username, email, password);
        
        if (user) {
            isLoggedIn = true;
            currentUser = user;
            favorites = [];
            
            registerModal.style.display = 'none';
            updateUIForLoggedIn();
            showNotification('Registration successful', 'success');
        } else {
            showNotification('Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed', 'error');
    } finally {
        hideLoader();
    }
}

// Check logged in status
async function checkLoggedInStatus() {
    const sessionData = await checkSession();
    
    if (sessionData && sessionData.user) {
        isLoggedIn = true;
        currentUser = sessionData.user;
        favorites = await getFavorites(currentUser.id);
        updateUIForLoggedIn();
        
        // Refresh content to update favorites
        if (currentGrid.children.length > 0) {
            contentGrid.innerHTML = '';
            loadContent();
        }
    }
}

// Update UI for logged in user
function updateUIForLoggedIn() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    profileBtn.style.display = 'block';
    logoutBtn.style.display = 'block';
    
    if (currentUser && currentUser.username) {
        profileBtn.textContent = currentUser.username;
    }
}

// Update UI for logged out user
function updateUIForLoggedOut() {
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    profileBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
}

// Logout
async function logout() {
    showLoader();
    try {
        await performLogout();
        
        isLoggedIn = false;
        currentUser = null;
        favorites = [];
        
        updateUIForLoggedOut();
        showNotification('Logout successful', 'success');
        
        // If on favorites page, redirect to home
        if (currentCategory === 'favorites') {
            currentCategory = 'all';
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-category') === 'all');
            });
            updateContentTitle();
            contentGrid.innerHTML = '';
            loadContent();
        } else if (currentCategory !== 'search') {
            // Refresh content to update favorites
            contentGrid.innerHTML = '';
            loadContent();
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    } finally {
        hideLoader();
    }
}

// Save favorites to DB
async function saveFavoritesToDb() {
    if (!isLoggedIn || !currentUser) return;
    
    try {
        await updateFavorites(currentUser.id, favorites);
    } catch (error) {
        console.error('Error saving favorites:', error);
        showNotification('Failed to save favorites', 'error');
    }
}

// Show loader
function showLoader() {
    loadingSpinner.classList.remove('hidden');
}

// Hide loader
function hideLoader() {
    loadingSpinner.classList.add('hidden');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Apply type class
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// API Functions (these would normally communicate with your backend)
async function fetchFeaturedContent() {
    // Simulate API call to vidstream.io
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    title: 'The Last Journey',
                    poster: '/api/placeholder/300/170',
                    year: '2024',
                    rating: 8.7,
                    type: 'movie'
                },
                {
                    id: 2,
                    title: 'Cosmic Echoes',
                    poster: '/api/placeholder/300/170',
                    year: '2024',
                    rating: 9.2,
                    type: 'movie'
                },
                {
                    id: 3,
                    title: 'Shadow Dynasty',
                    poster: '/api/placeholder/300/170',
                    year: '2024',
                    rating: 8.5,
                    type: 'series'
                },
                {
                    id: 4,
                    title: 'Eternal Horizon',
                    poster: '/api/placeholder/300/170',
                    year: '2024',
                    rating: 7.9,
                    type: 'movie'
                },
                {
                    id: 5,
                    title: 'Quantum Break',
                    poster: '/api/placeholder/300/170',
                    year: '2023',
                    rating: 8.3,
                    type: 'series'
                },
                {
                    id: 6,
                    title: 'Lost in Tokyo',
                    poster: '/api/placeholder/300/170',
                    year: '2024',
                    rating: 9.0,
                    type: 'movie'
                }
            ]);
        }, 800);
    });
}

async function fetchContent(category, page, sort, genre) {
    // Simulate API call to vidstream.io
    return new Promise(resolve => {
        setTimeout(() => {
            // Generate mock data
            const mockData = [];
            const startId = (page - 1) * 20 + 7; // Start from ID 7 to avoid duplicate with featured
            
            for (let i = 0; i < 20; i++) {
                const id = startId + i;
                const isSeries = category === 'series' || (category === 'all' && Math.random() > 0.7);
                
                mockData.push({
                    id,
                    title: `${isSeries ? 'Series' : 'Movie'} Title ${id}`,
                    poster: `/api/placeholder/200/280`,
                    year: `${2020 + Math.floor(Math.random() * 5)}`,
                    rating: (6 + Math.random() * 4).toFixed(1),
                    type: isSeries ? 'series' : 'movie'
                });
            }
            
            // Apply filters
            let filteredData = mockData;
            
            if (category === 'movies') {
                filteredData = mockData.filter(item => item.type === 'movie');
            } else if (category === 'series') {
                filteredData = mockData.filter(item => item.type === 'series');
            } else if (category === 'favorites') {
                filteredData = favorites;
            }
            
            resolve(filteredData);
        }, 800);
    });
}

async function fetchContentDetails(id) {
    // Simulate API call to vidstream.io
    return new Promise(resolve => {
        setTimeout(() => {
            const item = contentData.find(item => item.id === id) || {
                id,
                title: `Content Title ${id}`,
                poster: `/api/placeholder/300/450`,
                year: '2024',
                rating: 8.5,
                type: Math.random() > 0.5 ? 'movie' : 'series',
                duration: '2h 15min',
                genres: ['Action', 'Adventure', 'Sci-Fi'],
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.',
                cast: [
                    { name: 'Actor 1', image: '/api/placeholder/80/80' },
                    { name: 'Actor 2', image: '/api/placeholder/80/80' },
                    { name: 'Actor 3', image: '/api/placeholder/80/80' },
                    { name: 'Actor 4', image: '/api/placeholder/80/80' },
                    { name: 'Actor 5', image: '/api/placeholder/80/80' }
                ]
            };
            
            resolve(item);
        }, 800);
    });
}

async function searchContent(searchTerm) {
    // Simulate API call to vidstream.io
    return new Promise(resolve => {
        setTimeout(() => {
            // Generate mock search results
            const results = [];
            const count = Math.floor(Math.random() * 10) + 1; // 1-10 results
            
            for (let i = 0; i < count; i++) {
                const id = 1000 + i;
                const isSeries = Math.random() > 0.6;
                
                results.push({
                    id,
                    title: `${searchTerm} ${isSeries ? 'Series' : 'Movie'} ${i + 1}`,
                    poster: `/api/placeholder/200/280`,
                    year: `${2020 + Math.floor(Math.random() * 5)}`,
                    rating: (6 + Math.random() * 4).toFixed(1),
                    type: isSeries ? 'series' : 'movie'
                });
            }
            
            resolve(results);
        }, 800);
    });
}

// These functions would interact with your MongoDB or another data storage
// For this example, we're simulating with localStorage

async function login(username, password) {
    // Simulate checking credentials
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, you would check against your MongoDB
            // For now, we'll check localStorage or just simulate
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Set session
                localStorage.setItem('session', JSON.stringify({ userId: user.id }));
                resolve({ id: user.id, username: user.username, email: user.email });
            } else {
                resolve(null);
            }
        }, 800);
    });
}

async function register(username, email, password) {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, you would save to MongoDB
            // For now, we'll use localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if username or email already exists
            if (users.some(u => u.username === username || u.email === email)) {
                resolve(null);
                return;
            }
            
            const id = Date.now();
            const newUser = { id, username, email, password };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Set session
            localStorage.setItem('session', JSON.stringify({ userId: id }));
            
            resolve({ id, username, email });
        }, 800);
    });
}

async function checkSession() {
    return new Promise(resolve => {
        setTimeout(() => {
            const session = JSON.parse(localStorage.getItem('session'));
            
            if (session && session.userId) {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.id === session.userId);
                
                if (user) {
                    resolve({ user: { id: user.id, username: user.username, email: user.email } });
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        }, 300);
    });
}

async function performLogout() {
    return new Promise(resolve => {
        setTimeout(() => {
            localStorage.removeItem('session');
            resolve(true);
        }, 300);
    });
}

async function getFavorites(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, you would retrieve from MongoDB
            // For now, we'll use localStorage
            const allFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
            const userFavorites = allFavorites[userId] || [];
            
            resolve(userFavorites);
        }, 300);
    });
}

async function updateFavorites(userId, favorites) {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, you would save to MongoDB
            // For now, we'll use localStorage
            const allFavorites = JSON.parse(localStorage.getItem('favorites')) || {};
            allFavorites[userId] = favorites;
            
            localStorage.setItem('favorites', JSON.stringify(allFavorites));
            resolve(true);
        }, 300);
    });
}
