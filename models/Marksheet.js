const mongoose = require("mongoose");

const marksheetSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    studentName: {
      type: String,
      required: true,
    },
    programType: {
      type: String,
      enum: ["UNDERGRADUATE", "POSTGRADUATE"],
      required: [true, "Program type is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
        },
        marks: {
          theory: {
            type: Number,
            required: true,
            min: [0, "Theory marks cannot be negative"],
            max: [70, "Theory marks cannot exceed 70"],
          },
          internal: {
            type: Number,
            required: true,
            min: [0, "Internal marks cannot be negative"],
            max: [20, "Internal marks cannot exceed 20"],
          },
          practical: {
            type: Number,
            required: true,
            min: [0, "Practical marks cannot be negative"],
            max: [10, "Practical marks cannot exceed 10"],
          },
        },
        totalMarks: {
          type: Number,
          default: 100,
        },
        obtainedMarks: {
          type: Number,
          required: true,
        },
        credit: {
          type: Number,
          required: true,
          min: [0, "Credit cannot be negative"],
        },
        grade: {
          type: String,
          enum: ["O", "A+", "A", "B+", "B", "C", "D", "F"],
          required: true,
        },
        gradePoint: {
          type: Number,
          required: true,
        },
        result: {
          type: String,
          enum: ["PASS", "FAIL"],
          required: true,
        },
      },
    ],
    totalCredits: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
    },
    result: {
      type: String,
      enum: ["PASS", "FAIL"],
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Function to calculate grade and grade point
function calculateGradeAndPoint(percentage) {
  if (percentage >= 90) return { grade: "O", point: 10 };
  if (percentage >= 80) return { grade: "A+", point: 9 };
  if (percentage >= 70) return { grade: "A", point: 8 };
  if (percentage >= 60) return { grade: "B+", point: 7 };
  if (percentage >= 50) return { grade: "B", point: 6 };
  if (percentage >= 45) return { grade: "C", point: 5 };
  if (percentage >= 40) return { grade: "D", point: 4 };
  return { grade: "F", point: 0 };
}

// Pre-save middleware to calculate totals and results
marksheetSchema.pre("save", function (next) {
  let totalCredits = 0;
  let totalObtainedMarks = 0;
  let totalSubjects = this.subjects.length;

  // Loop through each subject to calculate obtained marks, grades, and results
  this.subjects.forEach((subject) => {
    subject.obtainedMarks =
      (subject.marks.theory || 0) +
      (subject.marks.internal || 0) +
      (subject.marks.practical || 0);

    const subjectPercentage = (subject.obtainedMarks / subject.totalMarks) * 100;
    const { grade, point } = calculateGradeAndPoint(subjectPercentage);

    subject.grade = grade;
    subject.gradePoint = point;
    subject.result = grade !== "F" ? "PASS" : "FAIL";

    totalCredits += subject.credit;
    totalObtainedMarks += subject.obtainedMarks;
  });

  // Calculate overall values
  this.totalCredits = totalCredits;
  this.totalMarks = totalSubjects * 100;
  this.obtainedMarks = totalObtainedMarks;
  this.percentage = (totalObtainedMarks / this.totalMarks) * 100;

  const { grade, point } = calculateGradeAndPoint(this.percentage);
  this.cgpa = point;
  this.result = this.subjects.some((subject) => subject.result === "FAIL")
    ? "FAIL"
    : "PASS";

  // Generate remarks
  if (this.percentage >= 90) {
    this.remarks = "Outstanding performance!";
  } else if (this.percentage >= 80) {
    this.remarks = "Excellent performance!";
  } else if (this.percentage >= 70) {
    this.remarks = "Good performance!";
  } else if (this.percentage >= 60) {
    this.remarks = "Satisfactory performance.";
  } else if (this.percentage >= 50) {
    this.remarks = "Average performance.";
  } else {
    this.remarks = "Needs improvement.";
  }

  next();
});

const Marksheet = mongoose.model("Marksheet", marksheetSchema);
module.exports = Marksheet;
