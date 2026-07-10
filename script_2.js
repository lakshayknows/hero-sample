/* ============================================================
   Furry Tail — Script (V2)
   Seamless Infinite Carousel & Scent Themes
   ============================================================ */

(function () {
  "use strict";

  // Product database following the brand book scent stories and color directions
  // Bright, premium colors designed to flow slowly and harmonize text color change
  const products = [
    {
      title: "Violet Leaf & Muslin",
      tagline: "The Daily Ritual",
      desc: "Fresh, green violet leaf softened by the intimate warmth of clean muslin. A gentle daily wash that cleanses without stripping, leaving their coat soft and home smelling like intention.",
      ingredientTitle: "Amino Acid Cleanse",
      ingredientDesc: "Gentle, plant-based surfactants that respect sensitive skin and frequent-wash coats.",
      colors: {
        bg: "#E6D8FF",         // bright fresh lavender/purple
        bgAccent: "#D8C2FF",
        text: "#28114F",       // deep royal violet
        textSoft: "#5C3A9E",
        hairline: "rgba(40, 17, 127, 0.16)"
      }
    },
    {
      title: "Santal & White Tea",
      tagline: "The Weekly Ritual",
      desc: "Warm, grounding, and slightly milky. Sandalwood gives depth and intimacy while white tea lifts it clean and clear. The scent of a slow Sunday morning.",
      ingredientTitle: "Probiotic Support",
      ingredientDesc: "Radish root ferment supports skin microbiome health, protecting the natural coat barrier.",
      colors: {
        bg: "#FFE6CC",         // bright peach
        bgAccent: "#FFD1A9",
        text: "#4F2600",       // deep bronze/brown
        textSoft: "#8A4E1B",
        hairline: "rgba(79, 38, 0, 0.16)"
      }
    },
    {
      title: "Fig & Neroli",
      tagline: "Between Sundays",
      desc: "Soft, honeyed fig lifted by the bright, citrusy splash of neroli. A fresh and breezy wash that keeps the energy alive between full baths, revitalizing both skin and spirit.",
      ingredientTitle: "Botanical Fig Extract",
      ingredientDesc: "Rich in antioxidants and natural enzymes to soothe irritation and enhance coat shine.",
      colors: {
        bg: "#D1F2D1",         // bright fresh green
        bgAccent: "#BFE8BF",
        text: "#103B1E",       // deep forest green
        textSoft: "#336B3D",
        hairline: "rgba(16, 59, 30, 0.16)"
      }
    }
  ];

  // Carousel layout details:
  // We have 5 items in the HTML DOM:
  // Index 0: Violet Leaf (Original)
  // Index 1: Santal & White Tea (Original - active by default)
  // Index 2: Fig & Neroli (Original)
  // Index 3: Violet Leaf (Clone)
  // Index 4: Santal & White Tea (Clone)
  
  const totalSlides = 5;
  let currentIndex = 1; // Default active starts at Santal & White Tea (Index 1)
  let isAnimating = false;
  let sweepTimeoutId = null;

  // DOM elements
  const root = document.documentElement;
  const track = document.getElementById("carousel-track");
  const nextBtn = document.getElementById("next-button");
  const ripple = document.getElementById("btn-ripple");
  
  // Background Backdrop Layers
  const backdropBase = document.getElementById("backdrop-base");
  const backdropSweep = document.getElementById("backdrop-sweep");
  
  // Left Panel Elements
  const tagEl = document.getElementById("product-tag");
  const titleEl = document.getElementById("scent-headline");
  const descEl = document.getElementById("scent-description");
  
  // Bottom Card Elements
  const cardTitleEl = document.getElementById("ingredient-title");
  const cardDescEl = document.getElementById("ingredient-desc");

  const slides = Array.from(document.querySelectorAll(".carousel-item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Set initial setup
  updateSlideClasses(currentIndex);
  applyColors(products[1]); // Santal details by default
  backdropBase.style.backgroundColor = products[1].colors.bg;

  // Translate track to focus on the active slide (each slide occupies 20% of track width)
  function positionTrack(index) {
    const offsetPercent = -index * 20;
    track.style.transform = `translateX(${offsetPercent}%)`;
  }

  // Update active/inactive styles on slides
  function updateSlideClasses(activeIndex) {
    // Map indices to ensure clones get highlighted correctly
    let normalizedIndex = activeIndex;
    if (activeIndex === 3) normalizedIndex = 0;
    if (activeIndex === 4) normalizedIndex = 1;

    slides.forEach((slide, i) => {
      let isSlideActive = (i === activeIndex);
      slide.classList.toggle("active", isSlideActive);
    });
  }

  // Apply colors to CSS Custom Properties
  function applyColors(product) {
    root.style.setProperty("--theme-bg", product.colors.bg);
    root.style.setProperty("--theme-bg-accent", product.colors.bgAccent);
    root.style.setProperty("--theme-text", product.colors.text);
    root.style.setProperty("--theme-text-soft", product.colors.textSoft);
    root.style.setProperty("--hairline-color", product.colors.hairline);
  }

  // Animate the text change in the left panel
  function transitionTextAndDetails(product) {
    if (reduceMotion) {
      tagEl.innerText = product.tagline;
      titleEl.innerText = product.title;
      descEl.innerText = product.desc;
      cardTitleEl.innerText = product.ingredientTitle;
      cardDescEl.innerText = product.ingredientDesc;
      return;
    }

    // Fade out text elements
    titleEl.style.opacity = 0;
    descEl.style.opacity = 0;
    tagEl.style.opacity = 0;
    cardTitleEl.style.opacity = 0;
    cardDescEl.style.opacity = 0;

    // Swap content mid-fade
    setTimeout(() => {
      tagEl.innerText = product.tagline;
      titleEl.innerText = product.title;
      descEl.innerText = product.desc;
      cardTitleEl.innerText = product.ingredientTitle;
      cardDescEl.innerText = product.ingredientDesc;

      // Fade in text elements
      titleEl.style.opacity = 1;
      descEl.style.opacity = 1;
      tagEl.style.opacity = 1;
      cardTitleEl.style.opacity = 1;
      cardDescEl.style.opacity = 1;
    }, 350);
  }

  // Trigger ripple effect inside next button
  function triggerNextButtonRipple() {
    if (reduceMotion) return;
    ripple.classList.remove("rippling");
    void ripple.offsetWidth; // force reflow
    ripple.classList.add("rippling");
  }

  // Transition to a specific index
  function slideTo(index) {
    if (isAnimating) return;
    isAnimating = true;

    // Immediately commit the pending color change if clicked during an active sweep
    if (sweepTimeoutId) {
      clearTimeout(sweepTimeoutId);
      sweepTimeoutId = null;
      
      let currentNormalized = currentIndex;
      if (currentIndex === 3) currentNormalized = 0;
      if (currentIndex === 4) currentNormalized = 1;
      const prevProduct = products[currentNormalized];
      
      backdropBase.style.backgroundColor = prevProduct.colors.bg;
      applyColors(prevProduct);
      backdropSweep.classList.remove("sweeping");
    }

    // Calculate normalized product index (0, 1, or 2)
    let productIndex = index;
    if (index === 3) productIndex = 0;
    if (index === 4) productIndex = 1;

    const nextProduct = products[productIndex];

    triggerNextButtonRipple();

    // Get Next button coordinates to anchor the circular color wipe origin
    const rect = nextBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    root.style.setProperty("--sweep-origin", `${x}px ${y}px`);

    // Prepare and trigger slow sweep color flow
    if (!reduceMotion) {
      backdropSweep.style.backgroundColor = nextProduct.colors.bg;
      backdropSweep.classList.remove("sweeping");
      void backdropSweep.offsetWidth; // force reflow
      backdropSweep.classList.add("sweeping");
    } else {
      backdropBase.style.backgroundColor = nextProduct.colors.bg;
      applyColors(nextProduct);
    }

    // Immediately update text colors and text soft colors so they transition slowly (CSS)
    // while the background slowly sweeps
    root.style.setProperty("--theme-text", nextProduct.colors.text);
    root.style.setProperty("--theme-text-soft", nextProduct.colors.textSoft);
    root.style.setProperty("--hairline-color", nextProduct.colors.hairline);
    
    transitionTextAndDetails(nextProduct);

    // Slide carousel track
    if (!reduceMotion) {
      track.classList.add("smooth-transition");
    }
    positionTrack(index);
    updateSlideClasses(index);

    currentIndex = index;

    // Snapping logic and button unlock is decoupled from slow background wipe:
    // Carousel settles in 850ms, so we unlock and snap at 900ms
    const lockTime = reduceMotion ? 0 : 900;
    setTimeout(() => {
      // Loop snapping logic (seamless jump from clones back to original slides)
      if (currentIndex >= 3) {
        track.classList.remove("smooth-transition");
        
        let targetOriginalIndex = currentIndex === 3 ? 0 : 1;
        positionTrack(targetOriginalIndex);
        updateSlideClasses(targetOriginalIndex);
        currentIndex = targetOriginalIndex;
      }
      isAnimating = false;
    }, lockTime);

    // Background sweep transition completes in 3800ms
    const sweepTime = reduceMotion ? 0 : 3800;
    sweepTimeoutId = setTimeout(() => {
      if (!reduceMotion) {
        // Commit background color state to base layer
        backdropBase.style.backgroundColor = nextProduct.colors.bg;
        applyColors(nextProduct);
        backdropSweep.classList.remove("sweeping");
      }
      sweepTimeoutId = null;
    }, sweepTime);
  }

  // Next button click handler
  nextBtn.addEventListener("click", () => {
    if (isAnimating) return;
    let nextIndex = currentIndex + 1;
    slideTo(nextIndex);
  });

  // Initialize layout positions
  positionTrack(currentIndex);
  
  // Set text transition styles for smooth fading
  const textElements = [tagEl, titleEl, descEl, cardTitleEl, cardDescEl];
  textElements.forEach(el => {
    if (el) {
      el.style.transition = "opacity 0.35s ease";
    }
  });

})();
