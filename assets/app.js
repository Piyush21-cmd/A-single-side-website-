(() => {
  "use strict";

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const inrFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });
  const formatINR = (value) => `₹${inrFormatter.format(Math.round(value))}`;
  const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* ---------------------------------------------------------
     Data used by both the catalogue and the estimator
     --------------------------------------------------------- */
  const bagData = {
    "scholar-pro-backpack": {
      name: "Scholar Pro Backpack",
      calcBase: 899,
      tiers: [
        { min: 50, max: 200, price: 899 },
        { min: 201, max: 499, price: 829 },
        { min: 500, max: Infinity, price: 769 },
      ],
    },
    "executive-laptop-briefcase": {
      name: "Executive Laptop Briefcase",
      calcBase: 1449,
      tiers: [
        { min: 50, max: 200, price: 1449 },
        { min: 201, max: 499, price: 1349 },
        { min: 500, max: Infinity, price: 1249 },
      ],
    },
    "terra-canvas-tote": {
      name: "Terra Canvas Tote",
      calcBase: 449,
      tiers: [
        { min: 50, max: 200, price: 449 },
        { min: 201, max: 499, price: 409 },
        { min: 500, max: Infinity, price: 379 },
      ],
    },
    "trailhead-duffle": {
      name: "Trailhead Weekender Duffle",
      calcBase: 1299,
      tiers: [
        { min: 50, max: 200, price: 1299 },
        { min: 201, max: 499, price: 1199 },
        { min: 500, max: Infinity, price: 1119 },
      ],
    },
    "metro-drawstring": {
      name: "Metro Drawstring Bag",
      calcBase: 119,
      tiers: [
        { min: 50, max: 200, price: 119 },
        { min: 201, max: 499, price: 104 },
        { min: 500, max: Infinity, price: 94 },
      ],
    },
    "campus-messenger": {
      name: "Campus Messenger Bag",
      calcBase: 725,
      tiers: [
        { min: 50, max: 200, price: 725 },
        { min: 201, max: 499, price: 675 },
        { min: 500, max: Infinity, price: 625 },
      ],
    },
  };

  const printMethods = {
    screen: { name: "Screen print", perUnit: 18, setup: 1200 },
    embroidery: { name: "Embroidery", perUnit: 55, setup: 2500 },
    sublimation: { name: "Sublimation", perUnit: 38, setup: 1800 },
  };

  const getTierIndex = (quantity) => {
    if (quantity >= 500) return 2;
    if (quantity >= 201) return 1;
    return 0;
  };

  const getVolumeDiscount = (quantity) => {
    if (quantity >= 1000) return 18;
    if (quantity >= 500) return 14;
    if (quantity >= 200) return 8;
    return 4;
  };

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  const toast = qs("#toast");
  let toastTimer = null;

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4200);
  };

  /* ---------------------------------------------------------
     Sticky header + navigation state
     --------------------------------------------------------- */
  const header = qs("#site-header");
  const navLinks = qsa(".nav-link");
  const scrollTargets = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? qs(href) : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);

  let scrollTicking = false;

  const updateScrollUI = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    const probe = window.scrollY + 145;
    let activeId = "";

    scrollTargets.forEach((section) => {
      if (section.offsetTop <= probe) activeId = `#${section.id}`;
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 24
    ) {
      activeId = "#footer";
    }

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeId);
    });

    scrollTicking = false;
  };

  const requestScrollUI = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener("scroll", requestScrollUI, { passive: true });
  window.addEventListener("resize", requestScrollUI);
  updateScrollUI();

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  const menuToggle = qs("#menu-toggle");
  const mobileMenu = qs("#mobile-menu");
  let menuIsOpen = false;
  let menuTimer = null;

  const setMobileMenu = (open, restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    window.clearTimeout(menuTimer);

    if (open) {
      menuIsOpen = true;
      mobileMenu.hidden = false;
      window.requestAnimationFrame(() => {
        mobileMenu.classList.add("is-open");
      });
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");
      document.body.classList.add("menu-open");
    } else {
      menuIsOpen = false;
      mobileMenu.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      document.body.classList.remove("menu-open");

      menuTimer = window.setTimeout(() => {
        if (!menuIsOpen) mobileMenu.hidden = true;
      }, prefersReducedMotion.matches ? 0 : 220);

      if (restoreFocus) menuToggle.focus();
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      setMobileMenu(!menuIsOpen);
    });

    qsa("a", mobileMenu).forEach((link) => {
      link.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuIsOpen) {
        setMobileMenu(false, true);
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (menuIsOpen && header && !header.contains(event.target)) {
        setMobileMenu(false);
      }
    });

    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const closeMenuOnDesktop = (event) => {
      if (event.matches && menuIsOpen) setMobileMenu(false);
    };

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", closeMenuOnDesktop);
    } else if (typeof desktopMedia.addListener === "function") {
      desktopMedia.addListener(closeMenuOnDesktop);
    }
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  const revealItems = qsa(".reveal");

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ---------------------------------------------------------
     Product filters
     --------------------------------------------------------- */
  const productGrid = qs("#product-grid");
  const productCards = qsa(".product-card", productGrid || document);
  const filterButtons = qsa(".filter-btn");
  const catalogShowing = qs("#catalog-showing");
  let filterTimer = null;

  const applyProductFilter = (filter) => {
    if (!productGrid) return;

    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    window.clearTimeout(filterTimer);
    productGrid.classList.add("is-filtering");

    filterTimer = window.setTimeout(
      () => {
        let visibleCount = 0;

        productCards.forEach((card) => {
          const matches =
            filter === "all" || card.dataset.category === filter;
          card.hidden = !matches;
          if (matches) visibleCount += 1;
        });

        productGrid.classList.toggle("is-single", visibleCount === 1);

        if (catalogShowing) {
          catalogShowing.textContent = String(visibleCount);
        }

        window.requestAnimationFrame(() => {
          productGrid.classList.remove("is-filtering");
        });
      },
      prefersReducedMotion.matches ? 0 : 140,
    );
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyProductFilter(button.dataset.filter || "all");
    });
  });

  /* ---------------------------------------------------------
     Product cards: live wholesale price
     --------------------------------------------------------- */
  const productCardsWithPricing = [];

  productCards.forEach((card) => {
    const productKey = card.dataset.product;
    const product = bagData[productKey];
    if (!product) return;

    const range = qs("[data-qty-range]", card);
    const output = qs("[data-qty-output]", card);
    const unitElement = qs("[data-unit-price]", card);
    const totalElement = qs("[data-total-price]", card);
    const starElement = qs("[data-unit-star]", card);
    const negotiableNote = qs("[data-negotiable-note]", card);
    const tierButtons = qsa("[data-tier]", card);
    const addButton = qs("[data-add-quote]", card);

    if (!range || !output || !unitElement || !totalElement) return;

    const updateCardPrice = () => {
      const quantity = Number(range.value);
      const tierIndex = getTierIndex(quantity);
      const tier = product.tiers[tierIndex];
      const total = quantity * tier.price;

      output.textContent = `${quantity.toLocaleString("en-IN")} pcs`;

      // Update the price text node without destroying the negotiable star
      // that is nested inside the same <strong> element.
      const unitText = unitElement.firstChild;
      if (unitText && unitText.nodeType === Node.TEXT_NODE) {
        unitText.nodeValue = formatINR(tier.price);
      } else {
        unitElement.textContent = formatINR(tier.price);
      }

      if (starElement) starElement.hidden = tierIndex !== 2;

      totalElement.textContent = formatINR(total);

      const progress =
        ((Number(range.value) - Number(range.min)) /
          (Number(range.max) - Number(range.min))) *
        100;
      range.style.setProperty("--progress", `${progress}%`);
      range.setAttribute(
        "aria-valuetext",
        `${quantity.toLocaleString("en-IN")} pieces at ${formatINR(tier.price)} each. Estimated total ${formatINR(total)}.`,
      );

      tierButtons.forEach((button) => {
        const active = Number(button.dataset.qty) === Number(range.value);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (negotiableNote) {
        negotiableNote.hidden = tierIndex !== 2;
      }
    };

    range.addEventListener("input", updateCardPrice);

    tierButtons.forEach((button) => {
      button.addEventListener("click", () => {
        range.value = button.dataset.qty;
        updateCardPrice();
      });
    });

    if (addButton) {
      addButton.addEventListener("click", () => {
        const quantity = Number(range.value);
        prefillQuoteForm({
          bagType: productKey,
          quantity,
          message: `Please quote for ${quantity.toLocaleString("en-IN")} pcs of the ${product.name}. I would like to discuss custom branding and delivery.`,
        });
        showToast(
          `${product.name} · ${quantity.toLocaleString("en-IN")} pcs added to your quote.`,
        );
        scrollToQuoteForm();
      });
    }

    updateCardPrice();
    productCardsWithPricing.push({
      card,
      productKey,
      product,
      range,
    });
  });

  /* ---------------------------------------------------------
     Bulk calculator
     --------------------------------------------------------- */
  const calcBag = qs("#calc-bag");
  const calcQty = qs("#calc-qty");
  const calcRange = qs("#calc-range");
  const calcMinus = qs("#calc-minus");
  const calcPlus = qs("#calc-plus");
  const calcTotal = qs("#calc-total");
  const calcDiscount = qs("#calc-discount");
  const calcPerUnit = qs("#calc-per-unit");
  const calcSavings = qs("#calc-savings");
  const calcSummary = qs("#calc-summary");
  const calcBreakdown = qs("#calc-breakdown");
  const negotiationBanner = qs("#negotiation-banner");
  const useEstimateButton = qs("#use-estimate");
  const printInputs = qsa('input[name="print-method"]');
  let latestEstimate = null;

  const updateRangeFill = (range) => {
    if (!range) return;
    const min = Number(range.min);
    const max = Number(range.max);
    const progress = ((Number(range.value) - min) / (max - min)) * 100;
    range.style.setProperty("--progress", `${progress}%`);
  };

  const getSelectedPrint = () =>
    printMethods[qs('input[name="print-method"]:checked')?.value] ||
    printMethods.screen;

  const updatePrintSelection = () => {
    printInputs.forEach((input) => {
      input.closest(".print-option")?.classList.toggle(
        "is-active",
        input.checked,
      );
    });
  };

  const getCalculatorQuantity = () =>
    clamp(Math.round(Number(calcQty?.value) || 250), 50, 2000);

  const updateCalculator = () => {
    if (!calcBag || !calcQty || !calcRange) return;

    const quantity = getCalculatorQuantity();
    const bag = bagData[calcBag.value] || bagData["scholar-pro-backpack"];
    const print = getSelectedPrint();
    const discountPct = getVolumeDiscount(quantity);

    const baseSubtotal = bag.calcBase * quantity;
    const discountAmount = Math.round((baseSubtotal * discountPct) / 100);
    const printCost = print.perUnit * quantity;
    const setupCost = print.setup;
    const total = baseSubtotal - discountAmount + printCost + setupCost;
    const perUnit = total / quantity;
    const bagLabel = calcBag.options[calcBag.selectedIndex]?.text
      ?.split("—")[0]
      ?.trim() || bag.name;

    latestEstimate = {
      bagType: calcBag.value,
      bagName: bag.name,
      quantity,
      printName: print.name,
      discountPct,
      total,
    };

    if (calcTotal) calcTotal.textContent = formatINR(total);
    if (calcDiscount) calcDiscount.textContent = `−${discountPct}%`;
    if (calcPerUnit) calcPerUnit.textContent = formatINR(perUnit);
    if (calcSavings) calcSavings.textContent = formatINR(discountAmount);
    if (calcSummary) {
      calcSummary.textContent = `${formatNumber(quantity)} × ${bagLabel} · ${print.name}`;
    }
    if (calcBreakdown) {
      calcBreakdown.textContent = `Base ${formatINR(baseSubtotal)} · Print ${formatINR(printCost)} · Setup ${formatINR(setupCost)}`;
    }

    if (negotiationBanner) {
      negotiationBanner.classList.toggle("is-negotiating", quantity >= 500);
    }

    if (String(calcRange.value) !== String(quantity)) {
      calcRange.value = String(quantity);
    }
    updateRangeFill(calcRange);

    calcQty.setAttribute(
      "aria-valuetext",
      `${quantity.toLocaleString("en-IN")} pieces. Estimated total ${formatINR(total)}, excluding GST.`,
    );
    updatePrintSelection();
  };

  const setCalculatorQuantity = (nextValue) => {
    if (!calcQty || !calcRange) return;
    const quantity = clamp(Math.round(Number(nextValue) || 50), 50, 2000);
    calcQty.value = String(quantity);
    calcRange.value = String(quantity);
    updateCalculator();
  };

  if (calcBag && calcQty && calcRange) {
    calcBag.addEventListener("change", updateCalculator);

    calcRange.addEventListener("input", () => {
      calcQty.value = calcRange.value;
      updateCalculator();
    });

    calcQty.addEventListener("input", () => {
      const quantity = Number(calcQty.value);
      if (!Number.isFinite(quantity)) return;
      if (quantity >= 50 && quantity <= 2000) {
        calcRange.value = String(quantity);
        updateCalculator();
      }
    });

    calcQty.addEventListener("blur", () => {
      const quantity = clamp(
        Math.round(Number(calcQty.value) || 50),
        50,
        2000,
      );
      setCalculatorQuantity(quantity);
    });

    calcMinus?.addEventListener("click", () => {
      setCalculatorQuantity(Number(calcQty.value) - 50);
    });

    calcPlus?.addEventListener("click", () => {
      setCalculatorQuantity(Number(calcQty.value) + 50);
    });

    printInputs.forEach((input) => {
      input.addEventListener("change", updateCalculator);
    });

    if (useEstimateButton) {
      useEstimateButton.addEventListener("click", () => {
        if (!latestEstimate) return;

        prefillQuoteForm({
          bagType: latestEstimate.bagType,
          quantity: latestEstimate.quantity,
          requestType: "bulk-quote",
          message: `Calculator estimate: ${formatNumber(latestEstimate.quantity)} × ${latestEstimate.bagName}, ${latestEstimate.printName}. Indicative total ${formatINR(latestEstimate.total)} ex-GST (${latestEstimate.discountPct}% bulk discount applied). Please confirm final pricing, material options and a sample plan.`,
        });
        showToast(
          `Estimate for ${formatNumber(latestEstimate.quantity)} pcs added to your brief.`,
        );
        scrollToQuoteForm();
      });
    }

    updateCalculator();
  }

  /* ---------------------------------------------------------
     Animated stats
     --------------------------------------------------------- */
  const counters = qsa("[data-counter]");
  const statsPanel = qs(".stats-panel");

  const formatCounterValue = (value, element) => {
    const decimals = Number(element.dataset.decimals || 0);
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const finishCounter = (element) => {
    const target = Number(element.dataset.target || 0);
    element.textContent = formatCounterValue(target, element);
    element.dataset.counted = "true";
  };

  const animateCounter = (element) => {
    if (element.dataset.counted === "true") return;
    const target = Number(element.dataset.target || 0);
    const duration = 1500;

    if (prefersReducedMotion.matches) {
      finishCounter(element);
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatCounterValue(target * eased, element);

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        finishCounter(element);
      }
    };

    window.requestAnimationFrame(tick);
  };

  const startCounters = () => {
    counters.forEach(animateCounter);
  };

  if (counters.length) {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      counters.forEach(finishCounter);
    } else {
      counters.forEach((counter) => {
        counter.textContent = formatCounterValue(0, counter);
      });

      if (statsPanel) {
        const statsObserver = new IntersectionObserver(
          (entries, observer) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              startCounters();
              observer.disconnect();
            }
          },
          { threshold: 0.2 },
        );
        statsObserver.observe(statsPanel);
      } else {
        startCounters();
      }
    }
  }

  /* ---------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------- */
  const faqItems = qsa(".faq-item");
  const faqTriggers = faqItems
    .map((item) => qs(".faq-trigger", item))
    .filter(Boolean);

  faqItems.forEach((item) => {
    const trigger = qs(".faq-trigger", item);
    const panel = qs(".faq-answer", item);
    const isOpen = item.classList.contains("is-open");

    if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
    if (panel) {
      panel.setAttribute("aria-hidden", String(!isOpen));
      panel.toggleAttribute("inert", !isOpen);
    }
  });

  const setFaqState = (item, open) => {
    const trigger = qs(".faq-trigger", item);
    const panel = qs(".faq-answer", item);

    item.classList.toggle("is-open", open);

    if (trigger) trigger.setAttribute("aria-expanded", String(open));
    if (panel) {
      panel.setAttribute("aria-hidden", String(!open));
      panel.toggleAttribute("inert", !open);
    }
  };

  faqItems.forEach((item) => {
    const trigger = qs(".faq-trigger", item);
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) setFaqState(otherItem, false);
      });

      setFaqState(item, !isOpen);
    });

    trigger.addEventListener("keydown", (event) => {
      const currentIndex = faqTriggers.indexOf(trigger);
      let nextIndex = null;

      if (event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % faqTriggers.length;
      } else if (event.key === "ArrowUp") {
        nextIndex =
          (currentIndex - 1 + faqTriggers.length) % faqTriggers.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = faqTriggers.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        faqTriggers[nextIndex].focus();
      }
    });
  });

  /* ---------------------------------------------------------
     Quote form, artwork upload and hand-off
     --------------------------------------------------------- */
  const quoteForm = qs("#quote-form");
  const formSuccess = qs("#form-success");
  const bagTypeSelect = qs("#bag-type");
  const targetQtyInput = qs("#target-qty");
  const requestTypeSelect = qs("#request-type");
  const messageInput = qs("#message");
  const logoInput = qs("#logo-upload");
  const dropzone = qs("#logo-dropzone");
  const filePreview = qs("#file-preview");
  const filePreviewIcon = qs("#file-preview-icon");
  const fileName = qs("#file-name");
  const fileSize = qs("#file-size");
  const removeFileButton = qs("#remove-file");
  const uploadError = qs("#upload-error");
  const contactFormPanel = qs(".contact-form-panel");
  const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
  const allowedExtensions = new Set([
    "ai",
    "pdf",
    "svg",
    "png",
    "jpg",
    "jpeg",
    "eps",
  ]);

  let uploadedFile = null;
  let previewObjectUrl = null;

  const clearUploadError = () => {
    if (!uploadError) return;
    uploadError.textContent = "";
    uploadError.classList.add("hidden");
  };

  const showUploadError = (message) => {
    if (!uploadError) return;
    uploadError.textContent = message;
    uploadError.classList.remove("hidden");
  };

  const restoreFileIcon = () => {
    if (!filePreviewIcon) return;
    filePreviewIcon.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#i-file"></use></svg>';
  };

  const clearUploadedFile = (focusDropzone = false) => {
    uploadedFile = null;

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }

    if (logoInput) logoInput.value = "";
    if (filePreview) filePreview.hidden = true;
    if (dropzone) dropzone.hidden = false;

    restoreFileIcon();
    clearUploadError();

    if (focusDropzone && dropzone) {
      dropzone.focus({ preventScroll: true });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const acceptArtworkFile = (file) => {
    if (!file) return;

    clearUploadError();

    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.has(extension)) {
      clearUploadedFile();
      showUploadError("That file type isn’t supported. Use AI, PDF, SVG, PNG, JPG or EPS.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      clearUploadedFile();
      showUploadError("This file is over 15 MB. Please compress it or share a link in the message.");
      return;
    }

    uploadedFile = file;

    if (fileName) fileName.textContent = file.name;
    if (fileSize) {
      fileSize.textContent = `${extension.toUpperCase()} · ${formatFileSize(file.size)}`;
    }

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

    restoreFileIcon();

    if (file.type.startsWith("image/") && filePreviewIcon) {
      const image = document.createElement("img");
      previewObjectUrl = URL.createObjectURL(file);
      image.src = previewObjectUrl;
      image.alt = "";
      filePreviewIcon.replaceChildren(image);
    }

    if (dropzone) dropzone.hidden = true;
    if (filePreview) filePreview.hidden = false;

    if (logoInput) {
      try {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        logoInput.files = transfer.files;
      } catch {
        // The UI can still hold the file reference if the browser restricts assignment.
      }
    }
  };

  if (logoInput && dropzone) {
    logoInput.addEventListener("change", () => {
      acceptArtworkFile(logoInput.files?.[0]);
    });

    dropzone.addEventListener("click", () => {
      logoInput.click();
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropzone.classList.add("is-dragging");
      });
    });

    ["dragleave", "dragend"].forEach((eventName) => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove("is-dragging");
      });
    });

    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      dropzone.classList.remove("is-dragging");

      const file = event.dataTransfer?.files?.[0];
      if (file) acceptArtworkFile(file);
    });
  }

  removeFileButton?.addEventListener("click", () => {
    clearUploadedFile(true);
  });

  const resetQuoteFormView = () => {
    if (formSuccess) formSuccess.hidden = true;
    if (quoteForm) {
      quoteForm.hidden = false;
      quoteForm.classList.remove("was-validated");
    }
    clearUploadedFile();
  };

  function prefillQuoteForm({
    bagType,
    quantity,
    message,
    requestType,
  } = {}) {
    if (!quoteForm) return;

    if (formSuccess && !formSuccess.hidden) {
      formSuccess.hidden = true;
      quoteForm.hidden = false;
    }

    if (bagTypeSelect && bagType) {
      const optionExists = qsa("option", bagTypeSelect).some(
        (option) => option.value === bagType,
      );
      if (optionExists) bagTypeSelect.value = bagType;
    }

    if (targetQtyInput && Number.isFinite(Number(quantity))) {
      targetQtyInput.value = String(quantity);
    }

    if (requestTypeSelect && requestType) {
      requestTypeSelect.value = requestType;
    }

    if (messageInput && message) {
      messageInput.value = message;
    }

    quoteForm.classList.remove("was-validated");
  }

  function scrollToQuoteForm() {
    const quoteSection = qs("#quote");
    if (!quoteSection) return;

    quoteSection.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });

    if (contactFormPanel) {
      contactFormPanel.classList.remove("is-highlighted");
      void contactFormPanel.offsetWidth;
      contactFormPanel.classList.add("is-highlighted");
      window.setTimeout(() => {
        contactFormPanel.classList.remove("is-highlighted");
      }, 1700);
    }
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      quoteForm.classList.add("was-validated");
      clearUploadError();

      if (!quoteForm.checkValidity()) {
        const firstInvalid = qs(":invalid", quoteForm);
        firstInvalid?.focus();
        quoteForm.reportValidity();
        return;
      }

      const fullName = qs("#full-name", quoteForm)?.value.trim() || "there";
      const businessName = qs("#business-name", quoteForm)?.value.trim() || "";
      const phone = qs("#phone", quoteForm)?.value.trim() || "";
      const quantity = Number(targetQtyInput?.value || 0);
      const bagLabel =
        bagTypeSelect?.selectedOptions?.[0]?.textContent?.trim() || "Custom bag";
      const requestType =
        requestTypeSelect?.selectedOptions?.[0]?.textContent?.trim() ||
        "Bulk pricing";
      const message = messageInput?.value.trim() || "";
      const reference = `JBM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const successName = qs("#success-name");
      const successRef = qs("#success-ref");
      const successStyle = qs("#success-style");
      const successQty = qs("#success-qty");
      const successType = qs("#success-type");
      const whatsappRequest = qs("#whatsapp-request");
      const emailRequest = qs("#email-request");

      if (successName) successName.textContent = fullName;
      if (successRef) successRef.textContent = reference;
      if (successStyle) successStyle.textContent = bagLabel;
      if (successQty) successQty.textContent = `${formatNumber(quantity)} pcs`;
      if (successType) successType.textContent = requestType;

      const artworkLine = uploadedFile
        ? `Artwork ready to share: ${uploadedFile.name}`
        : "";

      const requestLines = [
        "Hi Jyoti Bag Manufacturing, I’d like a quote / sample.",
        `Reference: ${reference}`,
        `Name: ${fullName}`,
        businessName ? `Business name / GST: ${businessName}` : "",
        `Phone / WhatsApp: ${phone}`,
        `Bag type: ${bagLabel}`,
        `Quantity: ${formatNumber(quantity)} pcs`,
        `Enquiry: ${requestType}`,
        message ? `Notes: ${message}` : "",
        artworkLine,
      ].filter(Boolean);

      const requestText = requestLines.join("\n");
      const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(requestText)}`;
      const emailSubject = `Quote request ${reference} — ${bagLabel}`;
      const emailUrl = `mailto:sales@jyotibagmfg.com?subject=${encodeURIComponent(
        emailSubject,
      )}&body=${encodeURIComponent(requestText)}`;

      if (whatsappRequest) whatsappRequest.href = whatsappUrl;
      if (emailRequest) emailRequest.href = emailUrl;

      quoteForm.hidden = true;
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.focus({ preventScroll: true });
        formSuccess.scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
        });
      }

      showToast("Request brief ready. Send it on WhatsApp or email.");
    });
  }

  qs("#new-request")?.addEventListener("click", () => {
    resetQuoteFormView();
    window.setTimeout(() => {
      qs("#full-name")?.focus({ preventScroll: true });
    }, 50);
  });

  /* ---------------------------------------------------------
     Footer + final touches
     --------------------------------------------------------- */
  const yearElement = qs("#copyright-year");
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());

  window.addEventListener("load", updateScrollUI);

  // Keep controls honest if a user resizes or uses browser history.
  window.addEventListener("pageshow", () => {
    if (menuIsOpen) setMobileMenu(false);
    updateScrollUI();
  });

})();
