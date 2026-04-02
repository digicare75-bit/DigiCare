/* ============================================
   HERO SLIDER - JavaScript
   Healthcare Doctor-Patient Management System
============================================ */

document.addEventListener('DOMContentLoaded', function() {
  
  // Slider Configuration
  const config = {
    autoSlideInterval: 10000, 
    transitionDuration: 800,
    totalSlides: 5
  };

  // DOM Elements
  const slider = document.getElementById('heroSlider');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('.dot');
  const currentSlideEl = document.querySelector('.current-slide');
  const totalSlidesEl = document.querySelector('.total-slides');
  const progressFill = document.getElementById('progressFill');

  // State
  let currentSlide = 1;
  let autoSlideTimer;
  let progressTimer;
  let isTransitioning = false;

  // Initialize Slider
  function init() {
    // Set total slides in counter
    if (totalSlidesEl) {
      totalSlidesEl.textContent = config.totalSlides.toString().padStart(2, '0');
    }

    // Start auto slide
    startAutoSlide();

    // Update initial state
    updateProgressBar();
  }

  // Go to specific slide
  function goToSlide(slideNumber) {
    if (isTransitioning || slideNumber === currentSlide) return;
    if (slideNumber < 1 || slideNumber > config.totalSlides) return;

    isTransitioning = true;

    // Remove active class from current slide
    const currentSlideEl = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    const currentDot = document.querySelector(`.dot[data-slide="${currentSlide}"]`);
    
    if (currentSlideEl) {
      currentSlideEl.classList.remove('active');
    }
    if (currentDot) {
      currentDot.classList.remove('active');
    }

    // Update current slide
    currentSlide = slideNumber;

    // Add active class to new slide
    const newSlideEl = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    const newDot = document.querySelector(`.dot[data-slide="${currentSlide}"]`);
    
    if (newSlideEl) {
      newSlideEl.classList.add('active');
    }
    if (newDot) {
      newDot.classList.add('active');
    }

    // Update counter
    updateSlideCounter();

    // Update progress bar
    updateProgressBar();

    // Reset auto slide timer
    resetAutoSlide();

    // Allow transition to complete
    setTimeout(() => {
      isTransitioning = false;
    }, config.transitionDuration);
  }

  // Next slide
  function nextSlide() {
    const next = currentSlide >= config.totalSlides ? 1 : currentSlide + 1;
    goToSlide(next);
  }

  // Previous slide
  function prevSlide() {
    const prev = currentSlide <= 1 ? config.totalSlides : currentSlide - 1;
    goToSlide(prev);
  }

  // Update slide counter
  function updateSlideCounter() {
    if (currentSlideEl) {
      currentSlideEl.textContent = currentSlide.toString().padStart(2, '0');
    }
  }

  // Update progress bar
  function updateProgressBar() {
    if (!progressFill) return;

    const progress = (currentSlide / config.totalSlides) * 100;
    progressFill.style.width = progress + '%';
  }

  // Start auto slide
  function startAutoSlide() {
    // Clear any existing timer
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
    }

    // Start new timer
    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, config.autoSlideInterval);

    // Start progress animation
    startProgressAnimation();
  }

  // Reset auto slide timer
  function resetAutoSlide() {
    // Clear existing timers
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
    }
    if (progressTimer) {
      clearInterval(progressTimer);
    }

    // Reset progress bar
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = ((currentSlide - 1) / config.totalSlides * 100) + '%';
      
      // Force reflow
      void progressFill.offsetWidth;
      
      progressFill.style.transition = '';
    }

    // Restart timers
    startAutoSlide();
  }

  // Progress bar animation
  function startProgressAnimation() {
    if (progressTimer) {
      clearInterval(progressTimer);
    }

    if (!progressFill) return;

    let startTime = Date.now();
    let duration = config.autoSlideInterval;

    progressTimer = setInterval(() => {
      let elapsed = Date.now() - startTime;
      let progress = (elapsed / duration) * (100 / config.totalSlides);
      
      // Calculate base progress from previous slides
      let baseProgress = ((currentSlide - 1) / config.totalSlides) * 100;
      
      progressFill.style.width = (baseProgress + progress) + '%';

      if (elapsed >= duration) {
        // Timer will be reset by nextSlide()
      }
    }, 50);
  }

  // Event Listeners

  // Previous button
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      prevSlide();
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      nextSlide();
    });
  }

  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      const slideNumber = parseInt(this.getAttribute('data-slide'));
      goToSlide(slideNumber);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  if (slider) {
    slider.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }
  }

  // Visibility change - pause when tab is hidden
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
      }
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    } else {
      startAutoSlide();
    }
  });

  // Initialize on load
  init();

  // Expose functions globally for external control
  window.heroSlider = {
    goToSlide: goToSlide,
    nextSlide: nextSlide,
    prevSlide: prevSlide,
    getCurrentSlide: function() { return currentSlide; }
  };

});

