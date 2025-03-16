// Constants for API endpoints
const BASE_API_URL = 'https://animeapi-lyart.vercel.app/anime';
const SEARCH_API_URL = 'https://animeapi-lyart.vercel.app/anime/search';
const TOP_AIRING_URL = `${BASE_API_URL}/trending`;
const RECENT_EPISODES_URL = `${BASE_API_URL}/recent-episodes`;
const POPULAR_URL = `${BASE_API_URL}/popular`;

// DOM Elements
const searchInput = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-box button');
const mainContent = document.querySelector('.main-content');
const trendingSection = document.querySelector('.trending .swiper-wrapper');
const recentSection = document.querySelector('.recent .swiper-wrapper');
const popularSection = document.querySelector('.popular .swiper-wrapper');
const searchResultsContainer = document.querySelector('.search-results');

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
  // Initialize all sections
  await Promise.all([
    loadTrending(),
    loadRecentEpisodes(),
    loadPopular()
  ]);

  // Initialize search functionality
  initSearch();
  
  // Initialize Swiper for carousels
  initSwipers();
}

// Initialize Swiper instances for each carousel
function initSwipers() {
  new Swiper('.trending .swiper', {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
      nextEl: '.trending .swiper-button-next',
      prevEl: '.trending .swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 5,
        spaceBetween: 20,
      }
    }
  });

  new Swiper('.recent .swiper', {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
      nextEl: '.recent .swiper-button-next',
      prevEl: '.recent .swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 5,
        spaceBetween: 20,
      }
    }
  });

  new Swiper('.popular .swiper', {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
      nextEl: '.popular .swiper-button-next',
      prevEl: '.popular .swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 5,
        spaceBetween: 20,
      }
    }
  });
}

// Initialize search functionality
function initSearch() {
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// Perform search with the API
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    showLoader();
    
    // Hide main content and show search results container
    mainContent.style.display = 'none';
    searchResultsContainer.style.display = 'block';
    searchResultsContainer.innerHTML = '<h2>Search Results</h2><div class="search-results-grid"></div>';

    const searchResultsGrid = document.querySelector('.search-results-grid');
    
    const response = await fetch(`${SEARCH_API_URL}?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.results || data.results.length === 0) {
      searchResultsGrid.innerHTML = '<p class="no-results">No results found. Try a different search.</p>';
      hideLoader();
      return;
    }

    // Display search results
    data.results.forEach(anime => {
      const animeCard = createAnimeCard(anime);
      searchResultsGrid.appendChild(animeCard);
    });
    
    // Add event listeners to the first result for redirect
    if (data.results.length > 0) {
      const firstResult = searchResultsGrid.querySelector('.anime-card');
      firstResult.classList.add('first-result');
      firstResult.addEventListener('click', () => {
        window.location.href = `${BASE_API_URL}/info?id=${data.results[0].id}`;
      });
    }

    // Add a back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Home';
    backButton.classList.add('back-button');
    backButton.addEventListener('click', () => {
      searchResultsContainer.style.display = 'none';
      mainContent.style.display = 'block';
      searchInput.value = '';
    });
    searchResultsContainer.prepend(backButton);

    hideLoader();
  } catch (error) {
    console.error('Search error:', error);
    searchResultsContainer.innerHTML = '<p class="error">An error occurred while searching. Please try again later.</p>';
    hideLoader();
  }
}

// Load trending anime
async function loadTrending() {
  try {
    const response = await fetch(TOP_AIRING_URL);
    const data = await response.json();
    
    if (data && data.results) {
      trendingSection.innerHTML = '';
      data.results.forEach(anime => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(createAnimeCard(anime));
        trendingSection.appendChild(slide);
      });
    }
  } catch (error) {
    console.error('Error loading trending anime:', error);
    trendingSection.innerHTML = '<div class="swiper-slide"><div class="error-card">Failed to load trending anime</div></div>';
  }
}

// Load recent episodes
async function loadRecentEpisodes() {
  try {
    const response = await fetch(RECENT_EPISODES_URL);
    const data = await response.json();
    
    if (data && data.results) {
      recentSection.innerHTML = '';
      data.results.forEach(anime => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(createAnimeCard(anime, true));
        recentSection.appendChild(slide);
      });
    }
  } catch (error) {
    console.error('Error loading recent episodes:', error);
    recentSection.innerHTML = '<div class="swiper-slide"><div class="error-card">Failed to load recent episodes</div></div>';
  }
}

// Load popular anime
async function loadPopular() {
  try {
    const response = await fetch(POPULAR_URL);
    const data = await response.json();
    
    if (data && data.results) {
      popularSection.innerHTML = '';
      data.results.forEach(anime => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(createAnimeCard(anime));
        popularSection.appendChild(slide);
      });
    }
  } catch (error) {
    console.error('Error loading popular anime:', error);
    popularSection.innerHTML = '<div class="swiper-slide"><div class="error-card">Failed to load popular anime</div></div>';
  }
}

// Create anime card elements
function createAnimeCard(anime, isEpisode = false) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.dataset.id = anime.id;

  // Create image container with proper aspect ratio
  const imageContainer = document.createElement('div');
  imageContainer.className = 'anime-image';
  
  const image = document.createElement('img');
  image.src = anime.image || 'images/placeholder.jpg';
  image.alt = anime.title || 'Anime Title';
  image.loading = 'lazy';
  imageContainer.appendChild(image);

  // Add episode number badge if this is a recent episode
  if (isEpisode && anime.episodeNumber) {
    const episodeBadge = document.createElement('span');
    episodeBadge.className = 'episode-badge';
    episodeBadge.textContent = `EP ${anime.episodeNumber}`;
    imageContainer.appendChild(episodeBadge);
  }

  // Create info container
  const infoContainer = document.createElement('div');
  infoContainer.className = 'anime-info';

  const title = document.createElement('h3');
  title.className = 'anime-title';
  title.textContent = anime.title || 'Unknown Title';
  infoContainer.appendChild(title);

  // Add additional info if available
  if (anime.releaseDate) {
    const releaseDate = document.createElement('p');
    releaseDate.className = 'anime-release';
    releaseDate.textContent = anime.releaseDate;
    infoContainer.appendChild(releaseDate);
  }

  if (anime.subOrDub) {
    const subDub = document.createElement('p');
    subDub.className = 'anime-sub-dub';
    subDub.textContent = anime.subOrDub;
    infoContainer.appendChild(subDub);
  }

  // Add rating if available
  if (anime.rating) {
    const rating = document.createElement('div');
    rating.className = 'anime-rating';
    
    const ratingIcon = document.createElement('i');
    ratingIcon.className = 'fas fa-star';
    
    const ratingValue = document.createElement('span');
    ratingValue.textContent = anime.rating;
    
    rating.appendChild(ratingIcon);
    rating.appendChild(ratingValue);
    infoContainer.appendChild(rating);
  }

  // Assemble the card
  card.appendChild(imageContainer);
  card.appendChild(infoContainer);

  // Add click event to redirect to anime details
  card.addEventListener('click', () => {
    window.location.href = `${BASE_API_URL}/info?id=${anime.id}`;
  });

  return card;
}

// Helper functions for loading state
function showLoader() {
  // Create loader if it doesn't exist
  if (!document.querySelector('.loader')) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  } else {
    document.querySelector('.loader').style.display = 'flex';
  }
}

function hideLoader() {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.style.display = 'none';
  }
}

// Add CSS for loader and search results that might be missing from the original CSS
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .search-results {
    display: none;
    padding: 20px;
    color: white;
  }
  
  .search-results h2 {
    margin-bottom: 20px;
    font-size: 24px;
  }
  
  .search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .no-results, .error {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    font-size: 18px;
  }
  
  .back-button {
    background-color: #e50914;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .back-button:hover {
    background-color: #f40612;
  }
  
  .first-result {
    border: 2px solid #e50914;
    transform: scale(1.02);
    transition: all 0.3s ease;
  }
  
  .episode-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #e50914;
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .error-card {
    background-color: rgba(255, 0, 0, 0.2);
    padding: 20px;
    border-radius: 4px;
    text-align: center;
  }
`;
document.head.appendChild(additionalStyles);
