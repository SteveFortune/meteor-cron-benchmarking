
Meteor.methods({
  ping: function() {
    return "pong";
  },
  pushBigJob: function() {
    Msgs.insert({ scheduleAt: new Date() });
  }
});

Meteor.publish('pendingJobs', function() {
  return Msgs.find({ doneAt: { $exists: false } });
});

Meteor.startup(function() {
  Msgs.remove({});
});
