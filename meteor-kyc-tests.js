// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by meteor-kyc.js.
import { name as packageName } from "meteor/relipa:meteor-kyc";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-kyc - example', function (test) {
  test.equal(packageName, "meteor-kyc");
});
