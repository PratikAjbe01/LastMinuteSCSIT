import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import mongoose from "mongoose";
import { File } from '../models/FileModel.js';
import axios from 'axios';

export const uploadFile = async (req, res) => {
  try {
    const { name, course, semester, subject, types, year, category, uploadedBy } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    if (!name || !course || !semester || !subject || !types || !year || !category) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF, JPG, PNG are allowed' });
    }

    if (file.size > 10 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'File size must be less than 10MB' });
    }

    if (!/^\d{4}$/.test(year)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Invalid year format' });
    }

   const validTypes = ['image', 'document'];
    if (typeof types !== 'string' || !validTypes.includes(types.toLowerCase())) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: 'Invalid file type. Must be "image" or "document"' });
    }

    // Determine resource_type for Cloudinary
    const isPDF = file.mimetype === 'application/pdf';
    const resourceType = isPDF ? 'raw' : 'image';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'Uploads',
      resource_type: resourceType,
      access_mode: 'public',
    });

    fs.unlinkSync(file.path); // Clean up local file

    // Save file metadata to MongoDB
    const newFile = new File({
      name,
      type: types.toLowerCase(),
      course,
      subject,
      semester,
      year,
      isFree: 'free',
      fileUrl: result.secure_url,
      contentType: file.mimetype,
      category,
      uploadedBy: uploadedBy || "anonymous",
    });

    await newFile.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: newFile._id,
        name,
        course,
        semester,
        subject,
        year,
        types: types.toLowerCase(),
        url: result.secure_url,
        public_id: result.public_id,
        asset_id: result.asset_id,
        category
      },
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

export const fetchFilesCourseAndSemester = async (req, res) => {
  try {
    const { course, semester } = req.body;

    if (!course || !semester) {
      return res.status(400).json({ success: false, message: 'Course and semester are required' });
    }

    const semesterNum = parseInt(semester, 10);
    if (isNaN(semesterNum) || semesterNum < 1) {
      return res.status(400).json({ success: false, message: 'Invalid semester value' });
    }

    const files = await File.find({ course, semester: semesterNum })
      .select('name type course subject semester year fileUrl category contentType')
      .lean();

    if (!files.length) {
      return res.status(200).json({
        success: true,
        message: 'No files found for the specified course and semester',
        data: [],
      });
    }

    const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `http://localhost:5000/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`
        };
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });
  } catch (err) {
    console.error('Fetch files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch files', error: err.message });
  }
};

export const proxyPdf = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const response = await axios.get(url, { responseType: 'stream' });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch file', error: error.message });
  }
};

export const fetchAllFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }).lean();

    const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `http://localhost:5000/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`
        };
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });

  } catch (err) {
    console.error('Fetch all files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch all files', error: err.message });
  }
};

export const fetchAdminFiles = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const files = await File.find({ uploadedBy: userId }).sort({ createdAt: -1 }).lean();;

      const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `http://localhost:5000/api/files/proxy?url=${encodeURIComponent(file.fileUrl)}`
        };
      }
      return file;
    });

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      data: modifiedFiles,
    });

  } catch (err) {
    console.error('Fetch admin files error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin files', error: err.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { id } = req.body;
    const { name, year } = req.body;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid file ID' });
    }

    if (!name || !year) {
      return res.status(400).json({ success: false, message: 'Name and year are required' });
    }

    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ success: false, message: 'Invalid year format' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User not authorized to edit this file' });
    }

    file.name = name;
    file.year = year;

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      data: file,
    });
  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ success: false, message: 'Failed to update file', error: err.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.body;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this file' });
    }

    // Delete from Cloudinary
    if (file.public_id) {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: file.resource_type
      });
    }

    // Delete from MongoDB
    await File.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete file', error: err.message });
  }
};