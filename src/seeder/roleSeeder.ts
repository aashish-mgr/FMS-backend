import Role from "../models/auth/roleModel";

const ROLES = ["admin","superAdmin","accountant"];

const roleSeeder = async () => {
    try {
    const existingRoles = await Role.findAll();

    if(existingRoles.length !== 0) {
        return;
    }
    
    ROLES.forEach(async role => {
        await Role.create({
             roleName: role
        } as any);
        
    })
    console.log("Roles seeded successfully");
    }
    catch (error) {
        console.error("Error seeding roles:", error);
    }


}

export {roleSeeder};