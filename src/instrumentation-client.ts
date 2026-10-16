import { initBotId } from "botid/client/core";

// The registration server action (requestAccess) is invoked via POST to the page it runs on.
initBotId({
  protect: [{ path: "/", method: "POST" }],
});
