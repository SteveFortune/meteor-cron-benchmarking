
var log = console.log.bind(console);

Meteor.methods({
  pushBigJob: function() {
    Msgs.insert({ scheduleAt: new Date() });
  },
  ping: function() {
    return "pong";
  }
});

Meteor.publish('pendingJobs', function() {
  return Msgs.find({ doneAt: { $exists: false } });
});

Meteor.startup(function() {

  Msgs.remove({});

  /**
   * The 'worker', sitting inside of our single Meteor instance.
   * Listens for jobs posted on the msg queue and processes them
   * every 5 seconds.
   *
   * Floods the JS event queue with no-ops. Scehdules 250,000
   * empty setTimeouts, which is meant to represent a very busy
   * Javascript process with a tonne of async IO operations.
   *
   * The result is that when the client calls the `ping` method,
   * the JS runtime has to process all of the other, job-related ops
   * in the queue before it can respond, causing a delay, see (a).
   *
   * Admittedly, this is probably quite far-removed from what
   * you'd expect to see in a normal js app. Its really just to
   * demonstrate the performance limitations of having all of our
   * jobs run in 1 server alongside our application code. I.e., that
   * the jobs will be processed with all of the other application
   * ops in a single thread and make the process incrementally
   * slower.
   *
   * Why didn't you just call Collection.insert a load of times
   * instead? Because that would distribute the scheduling of those
   * IO ops throughout the event queue, meaning that ops relating
   * to the `ping` method would still possibly be pushed
   * intermittently. See (b). I wanted the application to behave as
   * if it was processing so many immediate job-related ops that any
   * application ops were deferred, as in (a).
   *
   * (a)
   *  _____________________________________________
   * |                                   |
   * | 250k job-ops  ...                 | app-ops
   * |___________________________________|_________...
   *
   * (b)
   *  _____________________________________________
   * |        |        |        |        |
   * | job-op | app-op | job-op | app-op | job-op
   * |________|________|________|________|_________ ...
   *
   * @note Implemented some basic locking in here for demonstrational
   * purposes.
   */
  SyncedCron.add({
    name: 'longOp',
    schedule: function(parser) {
      return parser.text('every 5 seconds');
    },
    job: function() {

      var predicate = {
        doneAt: { $exists: false },
        startedAt: { $exists: false }
      };

      log('- Tick. ' + Msgs.find(predicate).count() + ' pending jobs on the queue.');

      var topJob = Msgs.findOne(predicate);
      if (!topJob) {
        return;
      }

      var nModified = Msgs.update(_.extend({}, predicate, { _id: topJob._id }), {
        $set: { startedAt: new Date() }
      });
      if (!nModified) {
        return;
      }

      log('- Flooding the event queue, simulating lots of IO');

      for (var i = 0; i < 250000; i++) {
        (function(i) {
          Meteor.setTimeout(function() {
            i *= 5;
          }, 0);
        })(i);
      }

      log('- Flooded');

      Msgs.update(topJob._id, {
        $set: {
          doneAt: new Date(),
          result: i
        }
      });

    }
  });

  SyncedCron.start();

});
