// Config typedefs
export type Config = {
   autonomy: number,
   departure: string,
   arrival: string,
   routes_db: string
}

export type BountyHunter = {
   planet: string,
   day: number
}

export type Empire = {
   countdown: number,
   bounty_hunters: BountyHunter[]
}

// Algorithm typedefs
export type PlanetDays = {
   planet: string;
   days: number;
}

export class MissionLog {
   planet: string;
   days: number;
   autonomy: number;
   hunters: number;
   history: MissionLog[];
   
   constructor(planet: string, days: number, autonomy: number, hunters: number, history: MissionLog[]) {
      this.planet = planet;
      this.days = days;
      this.autonomy = autonomy;
      this.hunters = hunters;
      this.history = history;
   }
   
   static departure(planet: string, autonomy: number): MissionLog {
      return new MissionLog(planet,
         0,
         autonomy,
         0,
         []
      );
   }
   
   refuel(autonomy: number, hunters: number): MissionLog {
      return new MissionLog(this.planet,
         this.days + 1,
         autonomy,
         this.hunters + hunters,
         [...this.history, this]
      );
   }
   
   to(planet: string, days: number, hunters: number): MissionLog {
      return new MissionLog(
         planet,
         this.days + days,
         this.autonomy - days,
         this.hunters + hunters,
         [...this.history, this]
      );
   }
}