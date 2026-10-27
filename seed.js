const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // resolves the SRV lookup problem on some networks (not from the lessons)

const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/user.js");
const Institution = require("./models/institution.js");
const Professional = require("./models/professional.js");

// All names, addresses, phone numbers and emails below are fictional.
const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Start from a clean registry and re-create the demo accounts
  await Institution.deleteMany({});
  await Professional.deleteMany({});
  await User.deleteMany({ username: { $in: ["demo_owner", "demo_visitor"] } });

  const password = bcrypt.hashSync("demo1234", 10);
  const owner = await User.create({ username: "demo_owner", password });
  const visitor = await User.create({ username: "demo_visitor", password });

  const institutions = await Institution.create([
    {
      name: "Riverside Health Center",
      sector: "Public",
      type: "Health center",
      city: "Podgorica",
      address: "12 Example Street",
      phone: "+382 20 000 101",
      email: "info@riverside.example.com",
      owner: owner._id,
      favoritedByUsers: [visitor._id],
    },
    {
      name: "Northern General Hospital",
      sector: "Public",
      type: "Hospital",
      city: "Nikšić",
      address: "4 Sample Avenue",
      phone: "+382 40 000 202",
      email: "contact@northern-hospital.example.com",
      owner: owner._id,
      favoritedByUsers: [visitor._id],
    },
    {
      name: "Green Leaf Pharmacy",
      sector: "Private",
      type: "Pharmacy",
      city: "Bar",
      address: "27 Demo Boulevard",
      phone: "+382 30 000 303",
      email: "hello@greenleaf.example.com",
      owner: owner._id,
    },
    {
      name: "Smile Dental Clinic",
      sector: "Private",
      type: "Dental clinic",
      city: "Budva",
      address: "9 Test Square",
      phone: "+382 33 000 404",
      email: "book@smile-dental.example.com",
      owner: visitor._id,
    },
    {
      name: "Precision Diagnostics Laboratory",
      sector: "Private",
      type: "Laboratory",
      city: "Podgorica",
      address: "31 Placeholder Road",
      phone: "+382 20 000 505",
      email: "lab@precision.example.com",
      owner: visitor._id,
    },
  ]);

  const [riverside, northern, greenLeaf, smile, lab] = institutions;

  await Professional.create([
    { name: "Ana Example", profession: "Physician", specialty: "Family medicine", institution: riverside._id, owner: owner._id },
    { name: "Marko Sample", profession: "Nurse / Technician", specialty: "Primary care", institution: riverside._id, owner: owner._id },
    { name: "Ivana Demo", profession: "Physician", specialty: "Cardiology", institution: northern._id, owner: owner._id },
    { name: "Petar Placeholder", profession: "Physician", specialty: "Surgery", institution: northern._id, owner: owner._id },
    { name: "Jelena Test", profession: "Pharmacist", specialty: "Clinical pharmacy", institution: greenLeaf._id, owner: owner._id },
    { name: "Nikola Fictional", profession: "Dentist", specialty: "Orthodontics", institution: smile._id, owner: visitor._id },
    { name: "Milica Mock", profession: "Laboratory technician", specialty: "Clinical biochemistry", institution: lab._id, owner: visitor._id },
  ]);

  await mongoose.disconnect();
};

seed();
