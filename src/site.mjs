// Site-wide settings for carsalesteam.com.
export const SITE = {
  name: 'CarSalesTeam',
  url: 'https://carsalesteam.com',
  // Enquiries go to the Actuathron sales inbox: CarSalesTeam is Actuathron's service for dealer groups.
  email: 'sales@carsalesteam.com',
  // The one-sentence definition. It is the first paragraph of the home page, its meta description,
  // the Organization and Service descriptions and the first line of llms.txt, word for word.
  description: 'CarSalesTeam is a managed workflow service for dealer groups and their dealerships that brings vehicle enquiries, test-drive requests and service follow-ups into one workflow, with your sales and service teams in control.',
  // The plain-words category used after "|" in page titles.
  category: 'Dealership enquiry follow-up for dealer groups',
  // The enterprise offer. There is no personal or consumer plan.
  offer: 'CarSalesTeam for dealer groups',
  // The company that runs the service.
  parent: { name: 'Actuathron', url: 'https://actuathron.com/' },
  // The one service, rendered as the home page from src/content/sectors/<sector>.json.
  sector: 'dealerships',
  guides: ['dealership-vehicle-enquiries', 'staff-minutes-per-resolved-request', 'approval-rules', 'workflow-exceptions', 'human-in-the-loop-workflow', 'workflow-baseline'],
  // Last real content change of each page (YYYY-MM-DD), used for sitemap lastmod and dateModified.
  // Update the date when you change what a page says. Guides carry their own dates in their JSON files.
  updated: {
    '/': '2026-10-31',
    '/guides': '2026-10-31',
    '/privacy': '2026-10-31',
  },
};
