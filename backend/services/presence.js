// Who's online right now: people with an open socket (server.js) and AI rivals
// that are playing or browsing (jobs/rivals.js). One map, so the admin panel's
// "Online now" sees everyone the same way.
export const onlineUsers = new Map();

let listener = () => {};
/** server.js registers the function that pushes presence to admins. */
export function onPresenceChange(fn) { listener = fn; }
export function presenceChanged() { listener(); }
