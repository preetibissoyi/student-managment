import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
  useTheme,
  Paper,
  Chip,
} from "@mui/material"
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Grade as GradeIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const MotionCard = motion(Card)
const MotionBox = motion(Box)

const Dashboard = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const adminToken = localStorage.getItem("adminToken")
  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}")
  const isAdmin = !!adminToken
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const adminCards = [
    {
      title: "Manage Students",
      description: "Add, edit, or remove student records",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: "/admin/students",
      color: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
      stat: "245 students",
    },
    {
      title: "Manage Results",
      description: "Add or update student results",
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: "/admin/results",
      color: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)",
      stat: "120 results pending",
    },
    {
      title: "Batch Results",
      description: "View and manage batch-wise results",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: "/admin/batch-results",
      color: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
      stat: "5 batches active",
    },
    {
      title: "Examination Cards",
      description: "Generate and manage examination cards",
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      path: "/admin/examination-cards",
      color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      stat: "35 cards pending",
    },
  ]

  const studentCards = [
    {
      title: "My Results",
      description: "View your academic results",
      icon: <GradeIcon sx={{ fontSize: 40 }} />,
      path: "/student/results",
      color: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
      stat: "3 new results",
    },
    {
      title: "My Profile",
      description: "View and update your profile",
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: "/student/profile",
      color: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)",
      stat: "Last updated 2 days ago",
    },
  ]

  const cards = isAdmin ? adminCards : studentCards
  const userData = isAdmin ? { name: "Admin" } : studentData

  // Quick stats for the dashboard
  const quickStats = isAdmin
    ? [
        { label: "Total Students", value: "245", icon: <PeopleIcon />, color: "#4776E6" },
        { label: "Average Score", value: "78%", icon: <TrendingUpIcon />, color: "#FF5E62" },
        { label: "Active Batches", value: "5", icon: <SchoolIcon />, color: "#2F80ED" },
        { label: "Notifications", value: "12", icon: <NotificationsIcon />, color: "#38ef7d" },
      ]
    : [
        { label: "Current GPA", value: studentData.gpa || "3.8", icon: <GradeIcon />, color: "#4776E6" },
        {
          label: "Completed Courses",
          value: studentData.completedCourses || "12",
          icon: <SchoolIcon />,
          color: "#FF5E62",
        },
        { label: "Notifications", value: "3", icon: <NotificationsIcon />, color: "#2F80ED" },
      ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <Container maxWidth="lg">
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 4,
          mb: 6,
          p: 4,
          borderRadius: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "white",
              color: "#764ba2",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            {userData.name ? userData.name.charAt(0).toUpperCase() : isAdmin ? "A" : "S"}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {greeting}, {userData.name || (isAdmin ? "Admin" : "Student")}!
            </Typography>
            <Typography variant="subtitle1">
              {isAdmin
                ? "Manage your student management system with ease"
                : "Track your academic progress and stay updated with your results"}
            </Typography>
          </Box>
        </Box>
      </MotionBox>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Quick Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <MotionBox
              component={Paper}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                height: "100%",
              }}
            >
              <Avatar sx={{ bgcolor: stat.color, mb: 1, width: 48, height: 48 }}>{stat.icon}</Avatar>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {isAdmin ? "Administrative Tools" : "Student Dashboard"}
        </Typography>
        <Chip
          label={isAdmin ? "Admin Access" : "Student Access"}
          color={isAdmin ? "primary" : "secondary"}
          variant="outlined"
        />
      </Box>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={isAdmin ? 3 : 6} key={card.title}>
              <motion.div variants={itemVariants}>
                <MotionCard
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 },
                  }}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      width: "100%",
                      background: card.color,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          mr: 2,
                          background: card.color,
                          color: "white",
                          width: 56,
                          height: 56,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {card.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {card.description}
                    </Typography>
                    <Chip
                      label={card.stat}
                      size="small"
                      sx={{
                        background: "rgba(0,0,0,0.05)",
                        fontWeight: 500,
                        mb: 1,
                      }}
                    />
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      disableElevation
                      fullWidth
                      onClick={() => navigate(card.path)}
                      sx={{
                        background: card.color,
                        "&:hover": {
                          background: card.color,
                          filter: "brightness(0.9)",
                        },
                      }}
                    >
                      Go to {card.title}
                    </Button>
                  </CardActions>
                </MotionCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Box sx={{ mt: 6, mb: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Student Management System • All rights reserved
        </Typography>
      </Box>
    </Container>
  )
}

export default Dashboard
