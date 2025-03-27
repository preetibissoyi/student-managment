import React, { useState } from 'react';
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
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import axios from 'axios';

const BatchResults = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState({
        batch: '',
        stream: '',
        semester: ''
    });
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedResults = [...results].sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/results/batch`,
                {
                    params: filters,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );

            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch batch results');
        } finally {
            setLoading(false);
        }
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return null;
        return sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />;
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Batch Results
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Batch"
                                name="batch"
                                value={filters.batch}
                                onChange={handleFilterChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Stream"
                                name="stream"
                                value={filters.stream}
                                onChange={handleFilterChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Semester"
                                name="semester"
                                value={filters.semester}
                                onChange={handleFilterChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'View Results'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {results.length > 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Student Name
                                            <IconButton onClick={() => handleSort('studentName')}>
                                                <SortIcon column="studentName" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Roll Number
                                            <IconButton onClick={() => handleSort('rollNumber')}>
                                                <SortIcon column="rollNumber" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>Program Type</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Total Marks
                                            <IconButton onClick={() => handleSort('totalMarks')}>
                                                <SortIcon column="totalMarks" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Obtained Marks
                                            <IconButton onClick={() => handleSort('obtainedMarks')}>
                                                <SortIcon column="obtainedMarks" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            Percentage
                                            <IconButton onClick={() => handleSort('percentage')}>
                                                <SortIcon column="percentage" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            CGPA
                                            <IconButton onClick={() => handleSort('cgpa')}>
                                                <SortIcon column="cgpa" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>Result Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedResults.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.studentName}</TableCell>
                                        <TableCell>{result.rollNumber}</TableCell>
                                        <TableCell>{result.programType}</TableCell>
                                        <TableCell>{result.totalMarks}</TableCell>
                                        <TableCell>{result.obtainedMarks}</TableCell>
                                        <TableCell>{result.percentage}%</TableCell>
                                        <TableCell>{result.cgpa}</TableCell>
                                        <TableCell>{result.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default BatchResults; 