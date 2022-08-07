type PriorityFunc<T> = (t: T) => number;

export default class PriorityQueue<T> {
   private readonly queue: Array<T>;
   private readonly priority: PriorityFunc<T>;
   
   constructor(priority: PriorityFunc<T>) {
      this.queue = [];
      this.priority = priority;
   }
   
   get length() {
      return this.queue.length;
   }
   
   insert(t: T) {
      let p = this.priority(t);
      let i = 0;
      while (i < this.queue.length && this.priority(this.queue[i]) <= p)
         i++;
      this.queue.splice(i, 0, t)
   }
   
   pull(): T {
      return this.queue.shift()!;
   }
}