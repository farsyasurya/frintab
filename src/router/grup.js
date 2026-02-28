const express = require("express");
const router = express.Router();
const { createGroup, joinGroup , getGroupMembers, getMyGroups , getGroupDetail} = require("../controllers/group");
const auth = require("../midleware/auth");

router.post("/create", auth, createGroup);
router.post("/join", auth, joinGroup);

router.get("/:groupId/members", auth, getGroupMembers);
router.get("/my", auth, getMyGroups);
router.get("/:groupId", auth, getGroupDetail);



module.exports = router;