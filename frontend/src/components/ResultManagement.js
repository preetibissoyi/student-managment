import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Grid,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ResultManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        programType: '',
        batch: '',
        stream: '',
        semester: '',
        academicYear: '',
        subjects: [{ name: '', credits: '', marks: '' }]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index] = {
            ...newSubjects[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            subjects: newSubjects
        }));
    };

    const addSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name: '', credits: '', marks: '' }]
        }));
    };

    const removeSubject = (index) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/results`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );

            setSuccess('Result published successfully!');
            setFormData({
                studentId: '',
                programType: '',
                batch: '',
                stream: '',
                semester: '',
                academicYear: '',
                subjects: [{ name: '', credits: '', marks: '' }]
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish result');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Publish Result
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Student ID"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Program Type"
                                name="programType"
                                value={formData.programType}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Batch"
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Stream"
                                name="stream"
                                value={formData.stream}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Academic Year"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Subjects
                            </Typography>
                            {formData.subjects.map((subject, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            value={subject.name}
                                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Credits"
                                            type="number"
                                            value={subject.credits}
                                            onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Marks"
                                            type="number"
                                            value={subject.marks}
                                            onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <IconButton
                                            color="error"
                                            onClick={() => removeSubject(index)}
                                            disabled={formData.subjects.length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addSubject}
                                sx={{ mb: 2 }}
                            >
                                Add Subject
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Publish Result'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default ResultManagement; 