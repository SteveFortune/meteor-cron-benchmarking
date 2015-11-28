
# Meteor, SyncedCron, JS - Profiling

### Objective

The objective of this project is to analyze a method of running scheduled tasks in a way that is compatible with our current stack.

My analysis will include documentation of:

  - Performance implications (speed, latency, etc.)
  - Resource usage (memory, thread and CPU core usage, etc.)
  - Design implications (code reuse, caveats, distribution, horizontal and vertical scaling potential, etc.)
  - Risks

I will compare this profile to that of another method also proposed.

### Proposed Method - SyncedCron or a vanilla node application, scheduled to run in separate worker instances

__Description of the architecture__
__Process diagram__
__Design Implications__
__Risks__

### Alternative Method - SyncedCron, all scheduled and running inside of 1 monolithic Meteor instance

__Description of the architecture__
__Process diagram__
__Design Implications__

__Risks__
- Javascript event loop, single threaded, everything is happening on 1 thread
  - not a good use of system resources
  - system more likely to leak, crash all at once
- Javascript event loop, CPU-bound jobs will block the _entire app_ until complete
  - coupled with point above, means that the entire application will wait for 1 background job to finish
  __Example diagram of how this works with the event loop__
  __Link to sample application that demonstrates the issue__
  - fragile and unscalable
- Single point of failure  
  - everything in 1 big thread, if anything goes wrong the entire application is forced down
  - whereas if the application is divided into independently executing processes, if one goes down the system as a whole can remain functioning
  - this design doesn't allow us to cluster these servers properly, e.g.:
    - We might find in production that one part of the system is under considerable load whereas another isn't
    - E.g. we might only need 2 application servers but many workers processing jobs
    - This monolithic design prevents us from scaling different components

### Examples - How others do it

- How does rocket chat do it?
- Kadria?
- Meteorhacks articles?

### Backend Stack

- Meteor.js
- Node.js
- MongoDB

### References
