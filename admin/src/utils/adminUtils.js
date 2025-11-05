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

export const getPhoneNumberByID = (id) => {
  const user = adminUsers.find((user) => user.id === id);
  return user ? user.phoneNumber : null;
};
