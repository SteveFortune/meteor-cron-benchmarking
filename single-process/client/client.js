
var log = console.log.bind(console);
var pingTimer;

function clearMetrics() {
  Session.set('counter', 0);
  Session.set('lastMs', 0);
  Session.set('longestMs', 0);
}

Template.bench.helpers({
  counter: function() {
    return Session.get('counter');
  },
  lastMs: function() {
    return Session.get('lastMs');
  },
  longestMs: function() {
    return Session.get('longestMs');
  }
});

Template.jobs.helpers({
  jobs: function() {
    return Msgs.find({});
  }
});

Template.bench.events({
  'click button#trigger': function() {
    Meteor.call('pushBigJob');
  },
  'click button#clear': clearMetrics
});

function timePing() {

  var tStart = performance.now();

  Meteor.call('ping', function(err, pong) {
    var tEnd = performance.now();
    var t = tEnd - tStart;
    if (err) {
      log('- Ping failed with ' + err);
    } else {
      var count = Session.get('counter');
      var longest = Session.get('longestMs');
      Session.set('lastMs', t);
      Session.set('counter', count + 1);
      if (t > longest) {
        Session.set('longestMs', t)
      }
    }
    log('- Took ' + t + ' milliseconds. Rescheduling.');
    schedulePing();
  });

}

function cancelPing() {
  clearTimeout(pingTimer);
}

function schedulePing() {
  cancelPing();
  pingTimer = setTimeout(timePing, 200);
}

Meteor.subscribe('pendingJobs');
Meteor.autorun(function() {
  if (Meteor.status().status === 'connected') {
    clearMetrics();
    schedulePing();
  } else {
    cancelPing();
  }
});
