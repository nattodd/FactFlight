// Navigation order only; question pools, preferences and saved scopes are unchanged.
(function(root){
'use strict';
const activityOrder=Object.freeze(['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']);
const api=Object.freeze({activityOrder});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightActivities=api;
})(globalThis);
