const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { listUsers, createUser, updateUser } = require("../controllers/usersController");

router.use(requireAuth);
router.get("/", requireRole("SUPER_ADMIN", "ADMIN"), listUsers);
router.post("/", requireRole("SUPER_ADMIN", "ADMIN"), createUser);
router.patch("/:id", requireRole("SUPER_ADMIN", "ADMIN"), updateUser);

module.exports = router;

