const express = require("express");
const router = express.Router();

const pinjamController = require("./pinjam.controller");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", authMiddleware, pinjamController.getAll);
router.get("/:id", authMiddleware, pinjamController.getById);
router.post("/", authMiddleware, pinjamController.create);
router.put("/:id", authMiddleware, pinjamController.update);
router.delete("/:id", authMiddleware, pinjamController.remove);

module.exports = router;