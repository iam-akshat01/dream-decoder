const express = require("express");
const router = express.Router();

const { submitDream , fetchDream , getRecentDreams, getAnalysisGraphs, getAITherapist} = require('../controllers/dreamController.js');

const verifyUser = require('../middlewares/authMiddleware');
const verifyuser = require("../middlewares/authMiddleware");

router.post('/', verifyUser, submitDream); // ✅ Protected route
router.post('/graph',verifyUser,getAnalysisGraphs);
router.get('/recent', verifyUser, getRecentDreams); // ✅ Must come first
router.post('/airesponse',verifyUser, getAITherapist); //ai response for getting therapist
router.get('/:id', fetchDream);                     // ✅ Now comes after


module.exports = router;

