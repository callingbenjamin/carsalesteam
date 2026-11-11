// Drawn parts of each home-page industry card: one 24px line motif, shown before the scenario name on the card's
// sample slate. No copy lives here: words come from src/content/sectors/<key>.json. Every piece is decorative
// (aria-hidden), and colours come from public/styles.css, because the Content Security Policy forbids style attributes.
const motif = paths => `<svg class="industry-motif" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const INDUSTRY_ART = {
  hotels: {
    motif: motif('<path d="M4.8 16.5a7.2 7.2 0 0 1 14.4 0M3 16.5h18M4.5 19.5h15M12 9.3V7"/><path d="M9.9 6.4h4.2" stroke-width="2.4"/>'),
  },
  brokerages: {
    motif: motif('<path d="M3.5 11 12 4l8.5 7M5.5 9.6V20h13V9.6M10 20v-5h4v5"/>'),
  },
  dealerships: {
    motif: motif('<path d="M4.6 16H3v-3.4c0-.6.4-1.1 1-1.3l2.6-.9 2-3.1c.3-.5.8-.8 1.4-.8h6.8c.6 0 1.1.3 1.4.8l2 3.2c.5.3.8.8.8 1.4V16h-1.6M9.4 16h5.2M8.4 10.4h11.4M13.5 6.5v3.9"/><circle cx="7" cy="16.2" r="2.3"/><circle cx="17" cy="16.2" r="2.3"/>'),
  },
  'home-services': {
    motif: motif('<path d="M14.6 3.7a4.6 4.6 0 0 0-2.7 5.6L4.2 17a1.9 1.9 0 0 0 2.7 2.7l7.7-7.7a4.6 4.6 0 0 0 5.6-2.7l-2.8.5-1.9-1.9.5-2.8z"/>'),
  },
  'property-management': {
    motif: motif('<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M10.5 21v-3.4h3V21"/><path d="M8.6 6.6h.8M14.6 6.6h.8M8.6 10.3h.8M14.6 10.3h.8M8.6 14h.8M14.6 14h.8" stroke-width="2.2"/>'),
  },
};
