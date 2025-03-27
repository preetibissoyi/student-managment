"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  Card,
  CardContent,
  useTheme,
  alpha,
  InputAdornment,
  Snackbar,
  TablePagination,
  Backdrop,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Class as ClassIcon,
  CalendarMonth as CalendarIcon,
  Key as KeyIcon,
  PhotoCamera as PhotoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { getAuthToken, logout } from "../utils/auth"
import { motion } from "framer-motion"

const MotionBox = motion(Box)
const MotionPaper = motion(Paper)

const StudentManagement = () => {
  const theme = useTheme()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProgram, setFilterProgram] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    studentName: "",
    collegeRollNumber: "",
    programType: "",
    stream: "",
    batch: "",
    email: "",
    password: "",
    profilePhoto: null,
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    // Filter students based on search term and program filter
    let result = [...students]

    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.collegeRollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.stream.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterProgram) {
      result = result.filter((student) => student.programType === filterProgram)
    }

    setFilteredStudents(result)
  }, [students, searchTerm, filterProgram])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()

      if (!token) {
        setError("Please login as admin to access this page")
        return
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const studentsWithFullUrls = response.data.data.students.map((student) => ({
        ...student,
        profilePhoto: student.profilePhoto ? `${process.env.REACT_APP_API_URL}/${student.profilePhoto}` : null,
      }))

      setStudents(studentsWithFullUrls)
      setFilteredStudents(studentsWithFullUrls)
      setError("")
      showSnackbar("Students loaded successfully", "success")
    } catch (err) {
      console.error("Error fetching students:", err)
      if (err.response?.status === 401) {
        logout()
      } else {
        setError(err.response?.data?.message || "Failed to fetch students")
        showSnackbar("Failed to load students", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: e.target.files[0],
    }))
  }

  // Function to generate examination roll number
  const generateExamRollNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    return `EX-${randomNum}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form data
      if (!formData.studentName.trim()) {
        setError("Student name is required")
        setLoading(false)
        return
      }
      if (!formData.email.trim()) {
        setError("Email is required")
        setLoading(false)
        return
      }
      if (!formData.password && !selectedStudent) {
        setError("Password is required")
        setLoading(false)
        return
      }
      if (!formData.collegeRollNumber.trim()) {
        setError("College roll number is required")
        setLoading(false)
        return
      }
      if (!formData.programType) {
        setError("Program type is required")
        setLoading(false)
        return
      }
      if (!formData.stream.trim()) {
        setError("Stream is required")
        setLoading(false)
        return
      }
      if (!formData.batch.trim()) {
        setError("Batch is required")
        setLoading(false)
        return
      }

      const token = getAuthToken()
      const formDataToSend = new FormData()

      // Append all form fields
      formDataToSend.append("studentName", formData.studentName.trim())
      formDataToSend.append("email", formData.email.trim().toLowerCase())
      if (formData.password) {
        formDataToSend.append("password", formData.password)
      }
      formDataToSend.append("collegeRollNumber", formData.collegeRollNumber.trim())
      formDataToSend.append("programType", formData.programType)
      formDataToSend.append("stream", formData.stream.trim())
      formDataToSend.append("batch", formData.batch.trim())

      // Only append profile photo if it exists
      if (formData.profilePhoto) {
        formDataToSend.append("profilePhoto", formData.profilePhoto)
      }

      let response

      if (selectedStudent) {
        // Update existing student
        response = await axios.put(`${process.env.REACT_APP_API_URL}/students/${selectedStudent._id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        showSnackbar("Student updated successfully", "success")
      } else {
        // Add new student
        response = await axios.post(`${process.env.REACT_APP_API_URL}/students`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        showSnackbar("Student added successfully", "success")
      }

      if (response.data.status === "success") {
        setOpenDialog(false)
        setFormData({
          studentName: "",
          collegeRollNumber: "",
          programType: "",
          stream: "",
          batch: "",
          email: "",
          password: "",
          profilePhoto: null,
        })
        fetchStudents()
      }
    } catch (err) {
      console.error("Error saving student:", err)
      if (err.response?.status === 401) {
        logout()
      } else {
        const errorMsg = err.response?.data?.message || "Failed to save student"
        setError(errorMsg)
        showSnackbar(errorMsg, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setFormData({
      ...student,
      password: "", // Don't populate password for security
      profilePhoto: null,
    })
    setOpenDialog(true)
  }

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        setLoading(true)
        const token = getAuthToken()
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.status === "success") {
          fetchStudents()
          showSnackbar("Student deleted successfully", "success")
        }
      } catch (err) {
        console.error("Error deleting student:", err)
        if (err.response?.status === 401) {
          logout()
        } else {
          const errorMsg = err.response?.data?.message || "Failed to delete student"
          setError(errorMsg)
          showSnackbar(errorMsg, "error")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const getProgramTypeColor = (type) => {
    return type === "UG" ? theme.palette.primary.main : theme.palette.secondary.main
  }

  return (
    <Container maxWidth="lg">
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
              <SchoolIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Student Management
              </Typography>
              <Typography variant="subtitle1">Manage student records, profiles, and academic information</Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              label={`${students.length} Students`}
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                fontWeight: "bold",
                "& .MuiChip-label": { px: 2 },
              }}
            />
          </Box>
        </Box>
      </MotionBox>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Program</InputLabel>
              <Select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                label="Filter by Program"
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Programs</MenuItem>
                <MenuItem value="UG">Undergraduate (UG)</MenuItem>
                <MenuItem value="PG">Postgraduate (PG)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStudents}
              sx={{ borderRadius: 2, height: "56px" }}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedStudent(null)
                setFormData({
                  studentName: "",
                  collegeRollNumber: "",
                  programType: "",
                  stream: "",
                  batch: "",
                  email: "",
                  password: "",
                  profilePhoto: null,
                })
                setOpenDialog(true)
              }}
              sx={{
                borderRadius: 2,
                height: "56px",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Add New Student
            </Button>
          </Grid>
        </Grid>
      </MotionPaper>

      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Profile Photo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>College Roll Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Exam Roll Number</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Program Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Stream</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Batch</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <SchoolIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                      <Typography variant="h6" color="text.secondary">
                        No students found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterProgram
                          ? "Try adjusting your filters"
                          : "Add a new student to get started"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student, index) => (
                  <TableRow
                    key={student._id}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Avatar
                        src={student.profilePhoto}
                        alt={student.studentName}
                        sx={{
                          width: 50,
                          height: 50,
                          border: `2px solid ${getProgramTypeColor(student.programType)}`,
                        }}
                      >
                        {student.studentName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {student.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.collegeRollNumber}</TableCell>
                    <TableCell>{student.examinationRollNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.programType}
                        size="small"
                        sx={{
                          bgcolor: alpha(getProgramTypeColor(student.programType), 0.1),
                          color: getProgramTypeColor(student.programType),
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell>{student.stream}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit Student">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(student)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            mr: 1,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Student">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(student._id)}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MotionPaper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            py: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {selectedStudent ? <EditIcon /> : <AddIcon />}
            <Typography variant="h6">{selectedStudent ? "Edit Student" : "Add New Student"}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon color="primary" /> Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <TextField
                      fullWidth
                      label="Student Name"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!selectedStudent}
                      margin="normal"
                      helperText={selectedStudent ? "Leave blank to keep current password" : ""}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<PhotoIcon />}
                        sx={{ mt: 1, borderRadius: 2, py: 1.5 }}
                      >
                        Upload Profile Photo
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                      </Button>
                      {formData.profilePhoto && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {formData.profilePhoto.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="secondary" /> Academic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <TextField
                      fullWidth
                      label="College Roll Number"
                      name="collegeRollNumber"
                      value={formData.collegeRollNumber}
                      onChange={handleChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl fullWidth required margin="normal">
                      <InputLabel>Program Type</InputLabel>
                      <Select
                        name="programType"
                        value={formData.programType}
                        onChange={handleChange}
                        label="Program Type"
                        startAdornment={
                          <InputAdornment position="start">
                            <SchoolIcon fontSize="small" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="UG">Undergraduate (UG)</MenuItem>
                        <MenuItem value="PG">Postgraduate (PG)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Stream"
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ClassIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      required
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              ml: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {loading ? <CircularProgress size={24} /> : selectedStudent ? "Update Student" : "Add Student"}
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default StudentManagement

