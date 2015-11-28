
/**
 * Message queue. Readonly on the client. Our worker Listens
 * to this and processes new messages every 5 seconds.
 */
Msgs = new Meteor.Collection('msgs');

var deny = function() { return false; };
Msgs.allow({ insert: deny, update: deny, remove: deny });
