
var log = console.log.bind(console);

Meteor.startup(function() {

  var jobHash = 'longOp' + process.env.PORT;

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

      log('- Flooding the event queue, simulating lots of IO');

      for (var i = 0, x = 0; i < 250000; i++) {
        Meteor.setTimeout(function() {}, 0);
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
