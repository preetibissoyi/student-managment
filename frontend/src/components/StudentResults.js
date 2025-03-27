"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs,
  Button,
} from "@mui/material"
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Class as ClassIcon,
  Timeline as TimelineIcon,
  EmojiEvents as EmojiEventsIcon,
  MenuBook as MenuBookIcon,
  Grade as GradeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from "@mui/icons-material"
import axios from "axios"
import { motion } from "framer-motion"

const MotionBox = motion(Box)
const MotionPaper = motion(Paper)
const MotionCard = motion(Card)

// Helper function to get color based on grade
const getGradeColor = (grade) => {
  const gradeMap = {
    "A+": "#4caf50",
    A: "#66bb6a",
    "A-": "#81c784",
    "B+": "#2196f3",
    B: "#42a5f5",
    "B-": "#64b5f6",
    "C+": "#ff9800",
    C: "#ffa726",
    "C-": "#ffb74d",
    D: "#f44336",
    F: "#e53935",
  }

  return gradeMap[grade] || "#757575"
}

// Helper function to get color based on CGPA
const getCGPAColor = (cgpa) => {
  if (cgpa >= 9.0) return "#4caf50"
  if (cgpa >= 8.0) return "#66bb6a"
  if (cgpa >= 7.0) return "#2196f3"
  if (cgpa >= 6.0) return "#ff9800"
  if (cgpa >= 5.0) return "#ffa726"
  return "#f44336"
}

// Helper function to get status color
const getStatusColor = (status) => {
  const statusMap = {
    Pass: "#4caf50",
    Fail: "#f44336",
    Incomplete: "#ff9800",
    Pending: "#2196f3",
  }

  return statusMap[status] || "#757575"
}

const StudentResults = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [results, setResults] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [selectedSemester, setSelectedSemester] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const studentToken = localStorage.getItem("studentToken")
        if (!studentToken) {
          setError("Please login to view your results")
          setLoading(false)
          return
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/results/student`, {
          headers: {
            Authorization: `Bearer ${studentToken}`,
          },
        })

        setResults(response.data.results)
        setStudentInfo(response.data.student)

        // Set the first semester as selected by default
        if (response.data.results && response.data.results.length > 0) {
          setSelectedSemester(response.data.results[0])
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch results")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    if (results && results.length > newValue) {
      setSelectedSemester(results[newValue])
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading your academic results...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Alert
            severity="error"
            sx={{
              mt: 4,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {error}
          </Alert>
        </MotionBox>
      </Container>
    )
  }

  if (!results || results.length === 0) {
    return (
      <Container maxWidth="md">
        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Alert
            severity="info"
            sx={{
              mt: 4,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            No results found. Your academic results will appear here once they are published.
          </Alert>
        </MotionBox>
      </Container>
    )
  }

  // Calculate overall statistics
  const totalSubjects = results.reduce((acc, semester) => acc + semester.subjects.length, 0)
  const bestGrade = results.reduce((best, semester) => {
    const semesterBest = semester.subjects.reduce((subBest, subject) => {
      if (!subBest || subject.grade === "A+" || subject.grade === "A") return subject.grade
      return subBest
    }, null)
    return semesterBest === "A+" ? "A+" : best === "A+" ? "A+" : semesterBest || best
  }, null)

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 4,
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: "white",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "white",
                color: theme.palette.primary.main,
              }}
            >
              <GradeIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Academic Results
              </Typography>
              <Typography variant="subtitle1">View your semester-wise academic performance and grades</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: alpha("white", 0.9),
                },
              }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: alpha("white", 0.9),
                },
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
      </MotionBox>

      {/* Student Information Card */}
      {studentInfo && (
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon color="primary" /> Student Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Student Name
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
                {studentInfo.name}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Roll Number
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
                {studentInfo.rollNumber}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Program
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
                {studentInfo.program}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ClassIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Stream
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
                {studentInfo.stream}
              </Typography>
            </Grid>
          </Grid>
        </MotionPaper>
      )}

      {/* Performance Summary Cards */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{ mb: 4 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <MotionCard
              elevation={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              sx={{
                borderRadius: 2,
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Overall CGPA
                  </Typography>
                  <Avatar sx={{ bgcolor: getCGPAColor(results[0].overallCGPA) }}>
                    <TimelineIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ color: getCGPAColor(results[0].overallCGPA) }}>
                  {results[0].overallCGPA}
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(results[0].overallCGPA / 10) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(getCGPAColor(results[0].overallCGPA), 0.2),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getCGPAColor(results[0].overallCGPA),
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Out of 10.0 scale
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <MotionCard
              elevation={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              sx={{
                borderRadius: 2,
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Final Status
                  </Typography>
                  <Avatar sx={{ bgcolor: getStatusColor(results[0].finalStatus) }}>
                    <EmojiEventsIcon />
                  </Avatar>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={results[0].finalStatus}
                    sx={{
                      bgcolor: alpha(getStatusColor(results[0].finalStatus), 0.1),
                      color: getStatusColor(results[0].finalStatus),
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      py: 2,
                      px: 1,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {results[0].finalStatus === "Pass"
                    ? "Congratulations on your academic achievement!"
                    : "Please contact your academic advisor for guidance."}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <MotionCard
              elevation={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              sx={{
                borderRadius: 2,
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Total Subjects
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <MenuBookIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {totalSubjects}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Across {results.length} semesters
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <MotionCard
              elevation={2}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              sx={{
                borderRadius: 2,
                height: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Best Grade
                  </Typography>
                  <Avatar sx={{ bgcolor: getGradeColor(bestGrade) }}>
                    <GradeIcon />
                  </Avatar>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ color: getGradeColor(bestGrade) }}>
                  {bestGrade || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Your highest achieved grade
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </MotionBox>

      {/* Semester Tabs */}
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          mb: 4,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                py: 2,
              },
            }}
          >
            {results.map((result, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="body1" fontWeight="medium">
                      Semester {result.semester}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.academicYear}
                    </Typography>
                  </Box>
                }
                sx={{
                  minWidth: 120,
                  "&.Mui-selected": {
                    color: theme.palette.primary.main,
                    fontWeight: "bold",
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Selected Semester Content */}
        {selectedSemester && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Semester {selectedSemester.semester} Results - {selectedSemester.academicYear}
              </Typography>
              <Chip
                label={`CGPA: ${selectedSemester.semesterCGPA}`}
                sx={{
                  bgcolor: alpha(getCGPAColor(selectedSemester.semesterCGPA), 0.1),
                  color: getCGPAColor(selectedSemester.semesterCGPA),
                  fontWeight: "bold",
                }}
              />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 1, overflow: "hidden" }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Subject</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Credits
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Marks
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Grade
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSemester.subjects.map((subject, subIndex) => (
                    <TableRow
                      key={subIndex}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {subject.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{subject.credits}</TableCell>
                      <TableCell align="center">{subject.marks}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Grade: ${subject.grade}`}>
                          <Chip
                            label={subject.grade}
                            size="small"
                            sx={{
                              bgcolor: alpha(getGradeColor(subject.grade), 0.1),
                              color: getGradeColor(subject.grade),
                              fontWeight: "bold",
                              minWidth: 40,
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Semester CGPA
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: getCGPAColor(selectedSemester.semesterCGPA) }}>
                  {selectedSemester.semesterCGPA}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Result Status
                </Typography>
                <Chip
                  label={selectedSemester.status}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: alpha(getStatusColor(selectedSemester.status), 0.1),
                    color: getStatusColor(selectedSemester.status),
                    fontWeight: "bold",
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Credits
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {selectedSemester.subjects.reduce((sum, subject) => sum + subject.credits, 0)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Marks
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {(
                    selectedSemester.subjects.reduce((sum, subject) => sum + subject.marks, 0) /
                    selectedSemester.subjects.length
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </MotionPaper>

      {/* Grade Scale Reference */}
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          mb: 4,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GradeIcon color="primary" /> Grading Scale Reference
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("A+"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("A+") }}>
                A+
              </Typography>
              <Typography variant="body2">90-100</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("A"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("A") }}>
                A
              </Typography>
              <Typography variant="body2">80-89</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("B+"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("B+") }}>
                B+
              </Typography>
              <Typography variant="body2">75-79</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("B"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("B") }}>
                B
              </Typography>
              <Typography variant="body2">70-74</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("C+"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("C+") }}>
                C+
              </Typography>
              <Typography variant="body2">65-69</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Box
              sx={{
                p: 1,
                textAlign: "center",
                borderRadius: 1,
                bgcolor: alpha(getGradeColor("F"), 0.1),
              }}
            >
              <Typography variant="h6" sx={{ color: getGradeColor("F") }}>
                F
              </Typography>
              <Typography variant="body2">Below 60</Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: This grading scale is for reference only. Please refer to your institution's official grading policy for
          detailed information.
        </Typography>
      </MotionPaper>

      {/* Footer Note */}
      <Box sx={{ textAlign: "center", mb: 4, mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Student Results Portal • All rights reserved
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          For any discrepancies in your results, please contact the examination department.
        </Typography>
      </Box>
    </Container>
  )
}

export default StudentResults

