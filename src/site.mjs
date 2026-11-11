// Site-wide settings for carsalesteam.com.
export const SITE = {
  name: 'CarSalesTeam',
  url: 'https://carsalesteam.com',
  // Enquiries go to the CarSalesTeam sales inbox.
  email: 'sales@carsalesteam.com',
  // The one-sentence definition. It is the first paragraph of the home page, its meta description,
  // the Organization and Service descriptions and the first line of llms.txt, word for word.
  description: 'CarSalesTeam is a managed workflow service that puts dealership vehicle enquiries, test drives and service follow-ups in one workflow, with staff in control.',
  // The brand part of every <title>, og:title, twitter:title and og:site_name.
  titleBrand: 'CarSalesTeam by Actuathron',
  // The plain-words category used in descriptions and share-image alt text.
  category: 'Dealership enquiry follow-up for dealer groups',
  // The enterprise offer. There is no personal or consumer plan.
  offer: 'CarSalesTeam for dealer groups',
  // The company that runs the service.
  parent: { name: 'Actuathron', url: 'https://actuathron.com/' },
  // The one service, rendered as the home page from src/content/sectors/<sector>.json.
  sector: 'dealerships',
  sectors: ['hotels', 'brokerages', 'dealerships', 'home-services', 'property-management'],
  // The company that serves each industry: its name as on its own website, and the industry in plain words.
  // The shared Industries menus read these.
  lines: {
    hotels: { name: 'LobbyClerk', industry: 'Hotels' },
    brokerages: { name: 'ClosingAide', industry: 'Brokerages' },
    dealerships: { name: 'CarSalesTeam', industry: 'Dealerships' },
    'home-services': { name: 'Crewola', industry: 'Home Services' },
    'property-management': { name: 'CondoStaff', industry: 'Property Management' },
  },
  // Each industry's own website, linked from the shared header and footer.
  sectorSites: {
    hotels: 'https://lobbyclerk.com/',
    brokerages: 'https://closingaide.com/',
    dealerships: 'https://carsalesteam.com/',
    'home-services': 'https://crewola.com/',
    'property-management': 'https://condostaff.com/',
  },

  guides: ['dealership-vehicle-enquiries', 'staff-minutes-per-resolved-request', 'approval-rules', 'workflow-exceptions', 'human-in-the-loop-workflow', 'workflow-baseline'],
  // Last real content change of each page (YYYY-MM-DD), used for sitemap lastmod and dateModified.
  // Update the date when you change what a page says. Guides carry their own dates in their JSON files.
  updated: {
    '/': '2026-11-11',
    '/guides': '2026-10-31',
    '/privacy': '2026-10-31',
  },
};
