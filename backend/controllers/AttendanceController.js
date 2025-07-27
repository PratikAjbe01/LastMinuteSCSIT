import { Attendance } from "../models/AttendanceModel.js";

export const getAttendance = async (req, res) => {
	try {
		const { course, semester } = req.params;
		const courseKey = course.toUpperCase().replace('-', '_');
		const attendance = await Attendance.findOne({ course: courseKey, semester });
		if (!attendance) {
			return res.status(404).json({ success: false, message: "Attendance data not found", data: [] });
		}
		res.status(200).json({ success: true, data: attendance.subjects });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const updateAttendance = async (req, res) => {
	try {
		const { course, semester } = req.params;
		const { subjects } = req.body;
		if (!Array.isArray(subjects)) {
			return res.status(400).json({ success: false, message: "Subjects array is required" });
		}
		const courseKey = course.toUpperCase().replace('-', '_');
		const sortedSubjects = subjects.map(subject => ({
			...subject,
			history: [...new Map(subject.history.map(h => [h.date, h])).values()].sort((a, b) => new Date(a.date) - new Date(b.date)),
		}));
		let attendance = await Attendance.findOne({ course: courseKey, semester });
		if (!attendance) {
			attendance = new Attendance({
				course: courseKey,
				semester,
				subjects: sortedSubjects,
			});
		} else {
			attendance.subjects = sortedSubjects;
		}
		await attendance.save();
		res.status(200).json({ success: true, data: attendance.subjects });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const resetSubjectAttendance = async (req, res) => {
	try {
		const { course, semester, subjectName } = req.params;
		const courseKey = course.toUpperCase().replace('-', '_');
		const attendance = await Attendance.findOne({ course: courseKey, semester });
		if (!attendance) {
			return res.status(404).json({ success: false, message: "Attendance data not found" });
		}
		const subject = attendance.subjects.find(s => s.name === subjectName);
		if (!subject) {
			return res.status(404).json({ success: false, message: "Subject not found" });
		}
		const startDate = subject.startDate || new Date().toISOString().split('T')[0];
		const daysDiff = Math.max(1, Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);
		subject.history = Array.from({ length: daysDiff }, (_, i) => ({
			date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + i)).toISOString().split('T')[0],
			status: "no-class",
		}));
		await attendance.save();
		res.status(200).json({ success: true, data: attendance.subjects });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const deleteAttendance = async (req, res) => {
	try {
		const { course, semester } = req.params;
		const courseKey = course.toUpperCase().replace('-', '_');
		const result = await Attendance.deleteOne({ course: courseKey, semester });
		if (result.deletedCount === 0) {
			return res.status(404).json({ success: false, message: "Attendance data not found" });
		}
		res.status(200).json({ success: true, message: "Attendance data deleted successfully" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const validateData = (req, res) => {
	const { course, semester, subjects } = req.body;
	try {
		const validatedSubjects = subjects.map(subject => {
			const total = subject.history.filter(h => h.status !== "no-class").length;
			const attended = subject.history.filter(h => h.status === "present").length;
			const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
			const goal = Math.min(Math.max(subject.goal, 1), 100);
			const canMiss = total > 0 && percentage >= goal ? Math.floor((attended - (goal / 100) * total) / (goal / 100)) : 0;
			const mustAttend = total > 0 && percentage < goal ? Math.ceil(((goal / 100) * total - attended) / (1 - goal / 100)) : 0;

			let status = "neutral";
			let message = "No classes recorded yet.";
			if (total > 0) {
				if (percentage >= goal) {
					status = "safe";
					message = canMiss === 0 ? "You are on the edge." : `You can miss ${canMiss} more class${canMiss !== 1 ? "es" : ""}.`;
				} else {
					status = "danger";
					message = `Attend next ${mustAttend} class${mustAttend !== 1 ? "es" : ""} to reach ${goal}%.`;
					const remainingClasses = Math.max(0, total - attended);
					if (mustAttend > remainingClasses) {
						message = `Attend all remaining ${remainingClasses} class${remainingClasses !== 1 ? "es" : ""} to improve your percentage.`;
					}
				}
			}

			return { ...subject, attended, total, percentage, status, message };
		});

		res.json({ success: true, data: { subjects: validatedSubjects } });
	} catch (error) {
		res.status(500).json({ success: false, message: "Validation failed" });
	}
};