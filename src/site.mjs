// Site-wide settings for carsalesteam.com.
export const SITE = {
  name: 'CarSalesTeam',
  url: 'https://carsalesteam.com',
  // Enquiries go to the CarSalesTeam sales inbox.
  email: 'sales@carsalesteam.com',
  // The one-sentence definition. It is the first paragraph of the home page, the Organization and Service
  // descriptions and the first line of llms.txt, word for word. Meta, og and twitter descriptions carry its
  // first 160 characters or fewer (metaDescription in src/layout.mjs).
  description: 'CarSalesTeam is a managed workflow service for dealer groups and their dealerships that brings vehicle enquiries, test-drive requests and service follow-ups into one workflow, with your sales and service teams in control.',
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
  // The industry this site serves: its name and the industry in plain words.
  lines: {
    dealerships: { name: 'CarSalesTeam', industry: 'Dealerships' },
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
