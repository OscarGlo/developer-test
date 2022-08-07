import fs from "fs";

import sqlite3 from "sqlite3";
import * as path from "path";
import PriorityQueue from "./priorityQueue";

import {Config, Empire, PlanetDays, MissionLog} from "./solverTypes";

export default class Solver {
   private database: sqlite3.Database;
   private config: Config;
   
   constructor(configPath: string) {
      // Load config
      if (!fs.existsSync(configPath))
         throw Error(`Config file not found at path '${configPath}'`);
      
      this.config = JSON.parse(fs.readFileSync(configPath).toString());
      
      // Load database
      const databasePath = path.resolve(path.dirname(configPath), this.config.routes_db);
      if (!fs.existsSync(databasePath))
         throw Error(`Database file not found at path '${databasePath}'`);
      
      this.database = new sqlite3.Database(databasePath, err => {
         if (err)
            throw Error(`Couldn't load universe db: ${err}`);
      });
   }
   
   // Async database query to get all neighbors and times
   private getNeighbours(planet: string): Promise<PlanetDays[]> {
      return new Promise((resolve, reject) => {
         this.database
            .prepare("SELECT origin as planet, travel_time as days FROM routes WHERE destination = ?"
               + " UNION SELECT destination as planet, travel_time as days FROM routes WHERE origin = ?",
               planet, planet)
            .all((err, rows) => {
               if (err) reject(err);
               resolve(rows);
            });
      });
   }
   
   private static probability(hunters: number) {
      let p = 0;
      for (let i = 0; i < hunters; i++)
         p += 9 ** i / 10 ** (i + 1);
      return 1 - p;
   }
   
   // Finds the best path throught the planets
   async bestPath(empire: Empire): Promise<MissionLog | null> {
      // Find best path
      let queue = new PriorityQueue<MissionLog>(pd => pd.days + pd.hunters * 10);
      queue.insert(MissionLog.departure(this.config.departure, this.config.autonomy));
      
      let path = null;
      
      while (queue.length > 0) {
         const log = queue.pull();
         
         if (log.planet === this.config.arrival) {
            path = log;
            break;
         }
         
         const neighbors = await this.getNeighbours(log.planet);
         // Travel to each neighbor
         for (const n of neighbors) {
            const hunters = empire.bounty_hunters.filter(hunter => hunter.day === log.days + n.days && hunter.planet === n.planet);
            
            if (log.autonomy >= n.days && log.days + n.days <= empire.countdown)
               queue.insert(log.to(n.planet, n.days, hunters.length));
         }
         
         // Refuel
         const hunters = empire.bounty_hunters.filter(hunter => hunter.day === log.days + 1 && hunter.planet === log.planet);
         if (log.days + 1 <= empire.countdown)
            queue.insert(log.refuel(this.config.autonomy, hunters.length));
      }
      
      return path;
   }
   
   // Calculates the best path and returns the odds of making it alive
   // Odds will be 0 if no viable path is found
   async getOdds(empire: Empire) {
      return this.pathOdds(await this.bestPath(empire));
   }
   
   pathOdds(path: MissionLog | null) {
      return path == null ? 0 : Solver.probability(path.hunters);
   }
}