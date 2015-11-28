
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

  /**
   * The 'worker', sitting inside of our single Meteor instance.
   * Listens for jobs posted on the msq queue and processes them
   * every 5 seconds.
   *
   * My hypothesis is that performing a CPU bound operation in
   * here will block the whole event loop on the server side,
   * thereby delaying the `ping` method until the job is
   * completed.
   *
   * @note Implemented some basic locking in here for demonstrational
   * purposes.
   */
  SyncedCron.add({
    name: 'cpuBoundOp',
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

      log('- Performing some CPU-boudn task.');
      // Some CPU-bound task which blocks the event loop
      for (var i = 0, x = 0; i < 1000000000; i++) {
        x = i / 2;
      }

      Msgs.update(topJob._id, {
        $set: {
          doneAt: new Date(),
          result: {
            i: i,
            x: x
          }
        }
      });

    }
  });

  SyncedCron.start();

});
