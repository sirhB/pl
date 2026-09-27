import { seedDatabase } from "../src/lib/store/seed";

const force = process.argv.includes("--force");

seedDatabase(force)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
