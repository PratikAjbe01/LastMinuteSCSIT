import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
	{
		course: {
			type: String,
			required: true,
		},
		semester: {
			type: String,
			required: true,
		},
		subjects: [
			{
				name: {
					type: String,
					required: true,
				},
				goal: {
					type: Number,
					default: 75,
					min: 1,
					max: 100,
				},
				startDate: {
					type: String,
					default: () => new Date().toISOString().split('T')[0],
				},
				history: [
					{
						date: {
							type: String,
							required: true,
						},
						status: {
							type: String,
							enum: ["present", "absent", "no-class"],
							required: true,
						},
					},
				],
			},
		],
	},
	{ timestamps: true }
);

attendanceSchema.index({ course: 1, semester: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);