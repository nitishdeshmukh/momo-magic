import bcrypt from "bcrypt";
import adminModel from "../models/adminModel.js";

const adminUsers = [
  {
    id: "admin",
    name: "Admin",
    password: "Admin@6262111109",
    role: "admin",
    phoneNumber: "+919893851208",
  },
  {
    id: "developer",
    name: "Developer",
    password: "Dev@7470669907",
    role: "developer",
    phoneNumber: "+919893851201",
  },
];

const seedAdminUsers = async () => {
  try {
    for (const admin of adminUsers) {
      const existingAdmin = await adminModel.findOne({ id: admin.id });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await adminModel.create({
          ...admin,
          password: hashedPassword,
        });
        console.log(`Seeded admin user: ${admin.name}`);
      } else {
        console.log(`Admin user ${admin.name} already exists`);
      }
    }
  } catch (error) {
    console.error("Error seeding admin users:", error);
  }
};

export default seedAdminUsers;
