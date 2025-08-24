import cloudinary from '../config/cloudinary.js';
import mongoose from "mongoose";
import { File } from '../models/FileModel.js';
import axios from 'axios';

const API_URL = "https://lastminutescsit-api.vercel.app"; 
// const API_URL = "http://localhost:5000";

export const uploadFile = async (req, res) => {
  try {
    let {
      name,
      course,
      semester,
      subject,
      types,
      year,
      category,
      uploadedBy,
      fileUrl,
      contentType,
      format,
      resourceType,
      text,
    } = req.body;

    if (!name || !course || !semester || !subject || !types || !year || !category || !uploadedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year format'
      });
    }

    const validTypes = ['text', 'image', 'document'];
    if (!validTypes.includes(types.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type field. Must be "text", "image", or "document"'
      });
    }

    if (types === "text") {
      if (!text || text.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Text content is required for text type'
        });
      }

      const newFile = new File({
        name,
        type: types.toLowerCase(),
        course,
        subject,
        semester,
        year,
        isFree: 'free',
        fileUrl: "textfile",
        category,
        uploadedBy,
        resourceType,
        text: text.trim(),
      });

      await newFile.save();

      return res.status(200).json({
        success: true,
        message: 'Text content saved successfully',
        data: {
          fileId: newFile._id,
          name,
          course,
          semester,
          subject,
          year,
          types: types.toLowerCase(),
          url: "textfile",
          category,
        },
      });
    } else {
      if (!fileUrl || typeof fileUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'File URL is required for non-text types'
        });
      }

      if (!contentType || !format) {
        return res.status(400).json({
          success: false,
          message: 'Content type and format are required for file uploads'
        });
      }

      let resolvedContentType;
      const lowerFormat = format.toLowerCase();

      if (contentType === 'raw') {
        resolvedContentType = 'application/pdf';
      } else if (contentType === 'image') {
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lowerFormat)) {
          resolvedContentType = `image/${lowerFormat === 'jpg' ? 'jpeg' : lowerFormat}`;
        }
      }

      if (!resolvedContentType) {
        return res.status(400).json({
          success: false,
          message: `Unsupported file format. Received contentType: '${contentType}', format: '${format}'`
        });
      }

      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (!allowedMimeTypes.includes(resolvedContentType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${resolvedContentType}. Only PDF, JPG, PNG, GIF, WEBP are allowed`
        });
      }

      if (resolvedContentType === 'application/pdf' && types.toLowerCase() !== 'document') {
        return res.status(400).json({
          success: false,
          message: 'PDF files must be categorized with type "document"'
        });
      }

      if (resolvedContentType.startsWith('image/') && types.toLowerCase() !== 'image') {
        return res.status(400).json({
          success: false,
          message: 'Image files must be categorized with type "image"'
        });
      }

      const newFile = new File({
        name,
        type: types.toLowerCase(),
        course,
        subject,
        semester,
        year,
        isFree: 'free',
        fileUrl,
        contentType: resolvedContentType,
        category,
        uploadedBy,
        format: lowerFormat,
        resourceType,
        ...(text && { text: text.trim() }),
      });

      await newFile.save();

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: newFile
      });
    }

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: err.message
    });
  }
};

export const fetchFilesCourseAndSemester = async (req, res) => {
  try {
    const { course, semester } = req.body;

    if (!course || !semester) {
      return res.status(400).json({ success: false, message: 'Course and semester are required' });
    }

    const semesterNum = parseInt(semester, 10);
    if (isNaN(semesterNum)) {
      return res.status(400).json({ success: false, message: 'Invalid semester value' });
    }

    const files = await File.find({ course, semester: semesterNum })
      .select('name type course subject semester year fileUrl text category contentType format views shares resourceType uploadedBy')
      .lean();

    if (!files.length) {
      return res.status(200).json({
        success: true,
        message: 'No files found for the specified course and semester',
        data: [],
      });
    }

    const modifiedFiles = files.map(file => {
      if (file.type === "document" && file.fileUrl && file.fileUrl.includes('cloudinary.com')) {
        if (file.contentType === 'application/pdf' || file.format === 'pdf') {
          return {
            ...file,
            fileUrl: `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`
          };
        }
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
          fileUrl: `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`
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

export const fetchAllFilesByViews = async (req, res) => {
  try {
    const files = await File.aggregate([
      {
        $sort: { views: -1 }
      },
      {
        $lookup: {
          from: "users",
          let: { uploaderIdString: "$uploadedBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$uploaderIdString" }]
                }
              }
            },
            {
              $project: { name: 1, email: 1 }
            }
          ],
          as: "uploaderInfo"
        }
      },
      {
        $unwind: {
          path: "$uploaderInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          type: 1,
          course: 1,
          subject: 1,
          year: 1,
          semester: 1,
          isFree: 1,
          fileUrl: 1,
          text: 1,
          contentType: 1,
          category: 1,
          resourceType: 1,
          views: 1,
          shares: 1,
          createdAt: 1,
          updatedAt: 1,
          uploadedBy: {
            $ifNull: ["$uploaderInfo", {
              _id: "$uploadedBy",
              name: "Unknown User",
              email: null
            }]
          }
        }
      }
    ]);

    const modifiedFiles = files.map(file => {
      if (file.type === "document" && file.fileUrl) {
        return {
          ...file,
          fileUrl: `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`
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
    console.error('Fetch all files by views error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch files', error: err.message });
  }
};

export const fetchAdminFiles = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const files = await File.find({ uploadedBy: userId }).sort({ createdAt: -1 }).lean();

    const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`
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

export const fetchfileById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'File ID is required' });
    }

    const file = await File.findById(id).lean();

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.type === "document") {
      file.fileUrl = `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`;
    }

    res.status(200).json({
      success: true,
      message: 'File retrieved successfully',
      data: file,
    });

  } catch (err) {
    console.error('Fetch file by ID error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch file', error: err.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const {
      id,
      name,
      year,
      course,
      semester,
      subject,
      category,
      type,
      resourceType,
      text,
      userId,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
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

    if (name !== undefined) file.name = name.trim();
    if (year !== undefined) file.year = year;
    if (course !== undefined) file.course = course.trim();
    if (semester !== undefined) file.semester = semester.trim();
    if (subject !== undefined) file.subject = subject.trim();
    if (category !== undefined) file.category = category;
    if (type !== undefined) file.type = type;
    if (resourceType !== undefined) file.resourceType = resourceType;
    if (text !== undefined) file.text = text.trim();

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
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this file' });
    }

    if (file.fileUrl && file.fileUrl.includes('cloudinary')) {
      const urlParts = file.fileUrl.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const publicId = fileNameWithExtension.split('.')[0];

      await cloudinary.uploader.destroy(publicId, {
        resource_type: file.type === 'image' ? 'image' : 'raw'
      });
    }

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

export const deleteAdminsFile = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.fileUrl && file.fileUrl.includes('cloudinary')) {
      const urlParts = file.fileUrl.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const publicId = fileNameWithExtension.split('.')[0];

      await cloudinary.uploader.destroy(publicId, {
        resource_type: file.type === 'image' ? 'image' : 'raw'
      });
    }

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

export const fetchAdminsFiles = async (req, res) => {
  try {
    const files = await File.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: "users",
          let: { uploaderId: { $toObjectId: "$uploadedBy" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$uploaderId"] } } },
            { $project: { name: 1, email: 1 } }
          ],
          as: "uploaderInfo"
        }
      },
      {
        $unwind: {
          path: "$uploaderInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          type: 1,
          course: 1,
          subject: 1,
          year: 1,
          semester: 1,
          isFree: 1,
          fileUrl: 1,
          text: 1,
          contentType: 1,
          category: 1,
          resourceType: 1,
          views: 1,
          createdAt: 1,
          updatedAt: 1,
          uploadedBy: {
            $ifNull: [
              "$uploaderInfo",
              { _id: "$uploadedBy", name: "Unknown or Deleted User", email: null }
            ]
          }
        }
      }
    ]);

    const modifiedFiles = files.map(file => {
      if (file.type === "document") {
        return {
          ...file,
          fileUrl: `${API_URL}/api/files/lastminute?url=${encodeURIComponent(file.fileUrl)}`
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
    res.status(500).json({ success: false, message: 'Failed to fetch files', error: err.message });
  }
};

export const updateAdminFile = async (req, res) => {
  try {
    const {
      id,
      name,
      year,
      course,
      semester,
      subject,
      category,
      type,
      resourceType,
      text,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid file ID' });
    }

    if (!name || !year || !course || !semester || !subject || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ success: false, message: 'Invalid year format.' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (name !== undefined) file.name = name.trim();
    if (year !== undefined) file.year = year;
    if (course !== undefined) file.course = course.trim();
    if (semester !== undefined) file.semester = semester.trim();
    if (subject !== undefined) file.subject = subject.trim();
    if (category !== undefined) file.category = category;
    if (type !== undefined) file.type = type;
    if (resourceType !== undefined) file.resourceType = resourceType;
    if (text !== undefined) file.text = text;

    await file.save();

    res.status(200).json({
      success: true,
      message: 'Admin File updated successfully',
      data: file,
    });

  } catch (err) {
    console.error('Update file error:', err);
    res.status(500).json({ success: false, message: 'Server error: Failed to update file.', error: err.message });
  }
};

export const increaseFileViews = async (req, res) => {
  try {
    const { id, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.views = (file.views || 0) + 1;
    if (userId) file.viewedBy.push(userId);

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File views updated successfully',
      data: file,
    });

  } catch (err) {
    console.error('Increase file views error:', err);
    res.status(500).json({ success: false, message: 'Server error: Failed to increase file views.', error: err.message });
  }
};

export const increaseFileShares = async (req, res) => {
  try {
    const { id, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.shares = (file.shares || 0) + 1;
    if(userId) file.sharedBy.push(userId);

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File shares updated successfully',
      data: file,
    });

  } catch (err) {
    console.error('Increase file shares error:', err);
    res.status(500).json({ success: false, message: 'Server error: Failed to increase file shares.', error: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { timeFilter } = req.query;
    const now = new Date();
    let startDate;

    const userIdsToExclude = [
      // Add any admin or test user IDs here to exclude them from the leaderboard
      // e.g., '6895f843be0be24cfae5f5ae'
    ];

    switch (timeFilter) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(0);
        break;
    }

    const leaderboardData = await File.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          uploadedBy: {
            $nin: userIdsToExclude,
            $regex: /^[0-9a-fA-F]{24}$/
          }
        }
      },
      {
        $group: {
          _id: { $toObjectId: "$uploadedBy" },
          uploadCount: { $sum: 1 },
          lastUpload: { $max: "$createdAt" },
          firstUpload: { $min: "$createdAt" },
        }
      },
      {
        $sort: {
          uploadCount: -1
        }
      },
      {
        $limit: 100
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          uploadCount: 1,
          lastUpload: 1,
          firstUpload: 1,
          name: 1,
          type: 1,
          course: 1,
          subject: 1,
          year: 1,
          semester: 1,
          isFree: 1,
          fileUrl: 1,
          contentType: 1,
          category: 1,
          resourceType: 1,
          views: 1,
          shares: 1,
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.name",
            email: "$userDetails.email"
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: leaderboardData });

  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ success: false, message: "Server error while fetching leaderboard." });
  }
};

export const getLeaderboardUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID." });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const stats = await File.aggregate([
      {
        $match: {
          uploadedBy: userId,
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};

    stats.forEach(item => {
      const monthName = monthNames[item.month - 1];
      monthlyData[`${item.year}-${item.month}`] = { month: monthName, count: item.count };
    });

    const result = [];
    const d = new Date();
    d.setDate(1);

    for (let i = 11; i >= 0; i--) {
      const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = monthNames[month - 1];
      const key = `${year}-${month}`;

      if (monthlyData[key]) {
        result.push(monthlyData[key]);
      } else {
        result.push({ month: monthName, count: 0 });
      }
    }

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("Error fetching user leaderboard stats:", error);
    res.status(500).json({ success: false, message: "Server error while fetching user stats." });
  }
};

