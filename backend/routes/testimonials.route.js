import express from 'express';
import { deleteTestimonial, getAllTestimonials, getAllTestimonialsApproved, getAllTestimonialsWithUserInfo, getTestimonial, getTestimonialsByUser, ToggleShowTestimonial, updateTestimonial, uploadTestimonial } from '../controllers/TestimonialsController.js';

const router = express.Router();

router.get('/getalltestimonials', getAllTestimonials);
router.get('/getalltestimonialsapproved', getAllTestimonialsApproved);
router.get('/gettestimonial/:id', getTestimonial);
router.get('/gettestimonialsbyuser/:id', getTestimonialsByUser);
router.post('/uploadtestimonial', uploadTestimonial);
router.put('/updatetestimonial/:id', updateTestimonial);
router.put('/togglshowtestimonial', ToggleShowTestimonial);
router.delete('/deletetestimonial/:id', deleteTestimonial);
router.get('/getalltestimonialswithuserinfo', getAllTestimonialsWithUserInfo);

export default router;
