/**
 * Utility function to extract airline initials from airline name
 * Examples:
 *   "Air Canada" -> "AC"
 *   "Emirates" -> "E"
 *   "KLM" -> "KL"
 *   "American Airlines" -> "AA"
 */
function getAirlineInitials(airlineName) {
  if (!airlineName || airlineName.trim() === "") {
    return "?";
  }

  const trimmed = airlineName.trim();

  // If already all uppercase and short (like KLM, AA), return first 2 letters
  if (
    trimmed === trimmed.toUpperCase() &&
    trimmed.length <= 4 &&
    !trimmed.includes(" ")
  ) {
    return trimmed.substring(0, 2);
  }

  // Split by spaces and take first letter of each word
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  let initials = "";

  if (words.length === 1) {
    // Single word: take first letter (e.g., "Emirates" -> "E")
    initials = words[0].charAt(0).toUpperCase();
  } else {
    // Multiple words: take first letter of each word (e.g., "Air Canada" -> "AC")
    for (let word of words) {
      if (word.length > 0) {
        initials += word.charAt(0).toUpperCase();
        // Limit to 2 letters max for multi-word names
        if (initials.length >= 2) {
          break;
        }
      }
    }
  }

  // Fallback: if no initials generated, take first letter
  if (initials.length === 0) {
    initials = trimmed.charAt(0).toUpperCase();
  }

  return initials;
}

/**
 * Creates an airline logo badge element
 */
function createAirlineLogo(airlineName, size = "normal") {
  const initials = getAirlineInitials(airlineName);
  const sizeClass =
    size === "small"
      ? "airline-logo-small"
      : size === "large"
      ? "airline-logo-large"
      : "";
  const logo = document.createElement("span");
  logo.className = `airline-logo ${sizeClass}`;
  logo.textContent = initials;
  return logo;
}

/**
 * Adds airline logos to all elements with data-airline attribute
 */
function initAirlineLogos() {
  document.querySelectorAll("[data-airline]").forEach(function (element) {
    // Check if logo already exists to prevent duplicates
    if (element.querySelector(".airline-logo")) {
      return; // Skip this element if logo already exists
    }

    const airlineName = element.getAttribute("data-airline");
    if (airlineName) {
      const size = element.getAttribute("data-size") || "normal";
      const logo = createAirlineLogo(airlineName, size);

      // Insert logo before the text content
      if (element.firstChild) {
        element.insertBefore(logo, element.firstChild);
      } else {
        element.appendChild(logo);
      }

      // Add wrapper class if not already present
      if (!element.classList.contains("airline-name-with-logo")) {
        element.classList.add("airline-name-with-logo");
      }
    }
  });
}

// Track if logos have been initialized to prevent multiple runs
let airlineLogosInitialized = false;

// Initialize on page load (only once)
function initializeAirlineLogosOnce() {
  if (!airlineLogosInitialized) {
    airlineLogosInitialized = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAirlineLogos);
    } else {
      initAirlineLogos();
    }
  }
}

// Initialize on page load
initializeAirlineLogosOnce();
