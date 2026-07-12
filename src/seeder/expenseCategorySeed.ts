import ExpenseCategory from "../models/category/expenceCategory";
import { category } from "../types/categoryType";

const expenseCategories: category[] = [{
    categoryName: "Salary",
    categoryDescription: "Monthly salary payments to full-time employees."
},
{
    categoryName: "Bonus",
    categoryDescription: "Performance or festival bonuses."
},
{
    categoryName: "Allowance",
    categoryDescription: "Transport, meal, or other allowances."
},
  {
    categoryName: "Freelancer Payment",
    categoryDescription: "Payments to freelance contractors.",
  },
  {
    categoryName: "Office Rent",
    categoryDescription: "Office space rental payments.",
  },
  {
    categoryName: "Office Electricity",
    categoryDescription: "Electricity utility bills.",
  },
  {
    categoryName: "Office Water",
    categoryDescription: "Water utility bills.",
  },
  {
    categoryName: "Office Internet",
    categoryDescription: "Internet/broadband subscription.",
  },
  {
    categoryName: "Office Stationery",
    categoryDescription: "Paper, pens, and general stationery.",
  },
  {
    categoryName: "Office Supplies",
    categoryDescription: "General office consumables.",
  },
  {
    categoryName: "Office Furniture",
    categoryDescription: "Office furniture purchases.",
  },
  {
    categoryName: "Office Maintenance",
    categoryDescription: "Office repairs and maintenance.",
  },
  {
    categoryName: "Office Cleaning",
    categoryDescription: "Cleaning services and supplies.",
  },
  {
    categoryName: "Server",
    categoryDescription: "Physical or cloud server costs.",
  },
  {
    categoryName: "Hosting",
    categoryDescription: "Web/app hosting subscriptions.",
  },
  {
    categoryName: "Domain",
    categoryDescription: "Domain registration and renewals.",
  },
  {
    categoryName: "SSL",
    categoryDescription: "SSL certificate purchases.",
  },
  {
    categoryName: "Software Subscription",
    categoryDescription: "SaaS tool subscriptions (e.g., Figma, Notion).",
  },
  {
    categoryName: "API Charges",
    categoryDescription: "Third-party API usage fees.",
  },
  {
    categoryName: "Facebook Ads",
    categoryDescription: "Meta/Facebook advertising spend.",
  },
  {
    categoryName: "Google Ads",
    categoryDescription: "Google advertising spend.",
  },
  {
    categoryName: "Printing",
    categoryDescription: "Banners, brochures, printed materials.",
  },
  {
    categoryName: "Events",
    categoryDescription: "Event sponsorships and participation costs.",
  },
  {
    categoryName: "Fuel",
    categoryDescription: "Fuel for company vehicles.",
  },
  {
    categoryName: "Travel",
    categoryDescription: "Bus, flight, or taxi travel costs.",
  },
  {
    categoryName: "Accommodation",
    categoryDescription: "Hotel or lodging costs.",
  },
  {
    categoryName: "Team Celebration",
    categoryDescription: "Team outing or party expenses.",
  },
  {
    categoryName: "Festival Celebration",
    categoryDescription: "Dashain, Tihar, and other festival celebrations.",
  },
  {
    categoryName: "Office Lunch",
    categoryDescription: "Team lunch or refreshments.",
  },
  {
    categoryName: "Gifts",
    categoryDescription: "Client or employee gifts.",
  },
  {
    categoryName: "Taxes",
    categoryDescription: "Government tax payments.",
  },
  {
    categoryName: "Bank Charges",
    categoryDescription: "Bank service fees and transaction charges.",
  },
  {
    categoryName: "Miscellaneous",
    categoryDescription: "Expenses that do not fit other categories.",
  },
];


const expenseSeeder = async () => {
    try {
    const expenseData  = await ExpenseCategory.findAll();
    if(expenseData.length !== 0) {
       return;
    }
    expenseCategories.forEach(async category => {
        await ExpenseCategory.create({
        "categoryName": category.categoryName ,
        "categoryDescription": category.categoryDescription
        }as any)
    })
    console.log("expense category seeded successfully");
}
catch(error) {
    console.log("Error seeding expense categories: ",error);
}
}

export {expenseSeeder};