
var log = console.log.bind(console);

Meteor.startup(function() {

  var jobHash = 'cpuBoundOp' + process.env.PORT;

  SyncedCron.add({
    name: jobHash,
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
