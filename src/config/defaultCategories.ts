// Default categories are seeded for every new workspace, and also used by the
// database seed for the backfilled default workspace. Keep them in one place so
// onboarding and seed data cannot drift apart.

export interface DefaultCategory {
  categoryName: string;
  categoryDescription: string;
}

export const DEFAULT_INCOME_CATEGORIES: readonly DefaultCategory[] = [
  { categoryName: "Software Development", categoryDescription: "Custom software and web application development revenue." },
  { categoryName: "Website Development", categoryDescription: "Static and dynamic website development projects." },
  { categoryName: "Mobile App Development", categoryDescription: "iOS and Android application development." },
  { categoryName: "ERP Development", categoryDescription: "Enterprise resource planning system development." },
  { categoryName: "Government Project", categoryDescription: "Projects contracted with government entities." },
  { categoryName: "School Training", categoryDescription: "IT training programs delivered to school students." },
  { categoryName: "College Training", categoryDescription: "IT training programs delivered to college students." },
  { categoryName: "Corporate Training", categoryDescription: "IT training delivered to corporate organizations." },
  { categoryName: "Online Class", categoryDescription: "Online / remote training sessions." },
  { categoryName: "Physical Class", categoryDescription: "In-person classroom training sessions." },
  { categoryName: "Consultancy", categoryDescription: "IT consultancy and advisory services." },
  { categoryName: "AMC / Maintenance", categoryDescription: "Annual maintenance contracts and support retainers." },
  { categoryName: "Hosting Services", categoryDescription: "Web hosting service revenue." },
  { categoryName: "Domain Services", categoryDescription: "Domain registration and renewal revenue." },
  { categoryName: "Other", categoryDescription: "Income that does not fit other categories." },
];

export const DEFAULT_EXPENSE_CATEGORIES: readonly DefaultCategory[] = [
  { categoryName: "Salary", categoryDescription: "Monthly salary payments to full-time employees." },
  { categoryName: "Bonus", categoryDescription: "Performance or festival bonuses." },
  { categoryName: "Allowance", categoryDescription: "Transport, meal, or other allowances." },
  { categoryName: "Freelancer Payment", categoryDescription: "Payments to freelance contractors." },
  { categoryName: "Office Rent", categoryDescription: "Office space rental payments." },
  { categoryName: "Office Electricity", categoryDescription: "Electricity utility bills." },
  { categoryName: "Office Water", categoryDescription: "Water utility bills." },
  { categoryName: "Office Internet", categoryDescription: "Internet/broadband subscription." },
  { categoryName: "Office Stationery", categoryDescription: "Paper, pens, and general stationery." },
  { categoryName: "Office Supplies", categoryDescription: "General office consumables." },
  { categoryName: "Office Furniture", categoryDescription: "Office furniture purchases." },
  { categoryName: "Office Maintenance", categoryDescription: "Office repairs and maintenance." },
  { categoryName: "Office Cleaning", categoryDescription: "Cleaning services and supplies." },
  { categoryName: "Server", categoryDescription: "Physical or cloud server costs." },
  { categoryName: "Hosting", categoryDescription: "Web/app hosting subscriptions." },
  { categoryName: "Domain", categoryDescription: "Domain registration and renewals." },
  { categoryName: "SSL", categoryDescription: "SSL certificate purchases." },
  { categoryName: "Software Subscription", categoryDescription: "SaaS tool subscriptions (e.g., Figma, Notion)." },
  { categoryName: "API Charges", categoryDescription: "Third-party API usage fees." },
  { categoryName: "Facebook Ads", categoryDescription: "Meta/Facebook advertising spend." },
  { categoryName: "Google Ads", categoryDescription: "Google advertising spend." },
  { categoryName: "Printing", categoryDescription: "Banners, brochures, printed materials." },
  { categoryName: "Events", categoryDescription: "Event sponsorships and participation costs." },
  { categoryName: "Fuel", categoryDescription: "Fuel for company vehicles." },
  { categoryName: "Travel", categoryDescription: "Bus, flight, or taxi travel costs." },
  { categoryName: "Accommodation", categoryDescription: "Hotel or lodging costs." },
  { categoryName: "Team Celebration", categoryDescription: "Team outing or party expenses." },
  { categoryName: "Festival Celebration", categoryDescription: "Dashain, Tihar, and other festival celebrations." },
  { categoryName: "Office Lunch", categoryDescription: "Team lunch or refreshments." },
  { categoryName: "Gifts", categoryDescription: "Client or employee gifts." },
  { categoryName: "Taxes", categoryDescription: "Government tax payments." },
  { categoryName: "Bank Charges", categoryDescription: "Bank service fees and transaction charges." },
  { categoryName: "Miscellaneous", categoryDescription: "Expenses that do not fit other categories." },
];
