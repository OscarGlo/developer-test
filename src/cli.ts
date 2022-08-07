import Solver from "./solver/solver";
import fs from "fs";

const [config, empirePath] = process.argv.slice(2);
const solver = new Solver(config);

// Load empire
if (!fs.existsSync(empirePath))
   throw Error(`Empire file not found at path '${empirePath}'`);

const empire = JSON.parse(fs.readFileSync(empirePath).toString());

solver.getOdds(empire).then(console.log);