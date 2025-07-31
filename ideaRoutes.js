// import express from "express";
// import {  setTeamIdea ,assignIdeaDomain} from "./ideaController.js";

// const router = express.Router();

// //router.get("/get-idea", getRandomIdea);
// router.post("/assign-idea", assignIdeaDomain);
// router.post("/set-idea", setTeamIdea);

// export default router;

import express from "express";
import { getRandomIdea, setTeamIdea } from "./ideaController.js";

const router = express.Router();

router.get("/get-idea", getRandomIdea);
router.post("/set-idea", setTeamIdea);

export default router;
