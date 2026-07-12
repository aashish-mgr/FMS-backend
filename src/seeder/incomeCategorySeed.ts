import IncomeCategory from "../models/category/incomeCategory";
import { category } from "../types/categoryType";

const incomeCategories: category[] = [
  {
    categoryName: "Software Development",
    categoryDescription:
      "Custom software and web application development revenue.",
  },
  {
    categoryName: "Website Development",
    categoryDescription: "Static and dynamic website development projects.",
  },
  {
    categoryName: "Mobile App Development",
    categoryDescription: "iOS and Android application development.",
  },
  {
    categoryName: "ERP Development",
    categoryDescription: "Enterprise resource planning system development.",
  },
  {
    categoryName: "Government Project",
    categoryDescription: "Projects contracted with government entities.",
  },
  {
    categoryName: "School Training",
    categoryDescription: "IT training programs delivered to school students.",
  },
  {
    categoryName: "College Training",
    categoryDescription: "IT training programs delivered to college students.",
  },
  {
    categoryName: "Corporate Training",
    categoryDescription: "IT training delivered to corporate organizations.",
  },
  {
    categoryName: "Online Class",
    categoryDescription: "Online / remote training sessions.",
  },
  {
    categoryName: "Physical Class",
    categoryDescription: "In-person classroom training sessions.",
  },
  {
    categoryName: "Consultancy",
    categoryDescription: "IT consultancy and advisory services.",
  },
  {
    categoryName: "AMC / Maintenance",
    categoryDescription: "Annual maintenance contracts and support retainers.",
  },
  {
    categoryName: "Hosting Services",
    categoryDescription: "Web hosting service revenue.",
  },
  {
    categoryName: "Domain Services",
    categoryDescription: "Domain registration and renewal revenue.",
  },
  {
    categoryName: "Other",
    categoryDescription: "Income that does not fit other categories.",
  },
];


const incomeSeeder = async () => {
    try {
    const incomeData  = await IncomeCategory.findAll();
    if(incomeData.length !== 0) {
       return;
    }
    incomeCategories.forEach(async category => {
        await IncomeCategory.create({
        "categoryName": category.categoryName ,
        "categoryDescription": category.categoryDescription
        }as any)
    })
    console.log("income category seeded successfully");
}
catch(error) {
    console.log("Error seeding income categories: ",error);
}
}

export {incomeSeeder};