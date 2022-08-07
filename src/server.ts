import express from "express";

import Solver from "./solver/solver";

const PORT = process.env.port ?? 8080;

const solver = new Solver("examples/example1/millennium-falcon.json");

const app = express();

app.use(express.static("public"))
app.use(express.json());

app.get("/", (req, res) => {
   res.sendFile(req.body);
});

app.post("/solver", async (req, res) => {
   const bestPath = await solver.bestPath(req.body);
   
   if (bestPath == null)
      return res.send({path: null, odds: 0});
   
   const odds = solver.pathOdds(bestPath);
   const path = [...bestPath.history!, bestPath]
      .map(l => ({planet: l.planet, days: l.days}))
   
   res.send({path, odds});
});

app.listen(PORT, () => console.log(`Express app listening on port ${PORT}`))