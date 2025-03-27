# Examination Card Component

This component allows you to generate and download examination admit cards for students.

## Setup Instructions

1. Add the following images to the `public` directory:
   - `college.png` - College logo (recommended size: 100x100px)
   - `principal.png` - Principal's signature (recommended size: 150x50px)
   - `controller.png` - Controller's signature (recommended size: 150x50px)

2. Import and use the component in your React application:

```jsx
import ExaminationCard from './components/ExaminationCard';

function App() {
  return (
    <div>
      <ExaminationCard />
    </div>
  );
}
```

## Features

- Form to input student details
- Photo upload capability
- Preview mode
- PDF download functionality
- Responsive design
- Print-friendly layout

## Required Dependencies

Make sure you have the following dependencies in your `package.json`:
- `jspdf`
- `html2canvas`

## Usage

1. Fill in the student details in the form
2. Upload a student photo
3. Click "Preview Admit Card" to see how it looks
4. Click "Edit Details" to make changes
5. Click "Download as PDF" to save the admit card as a PDF file

## Styling

The component uses its own CSS file (`ExaminationCard.css`) for styling. You can customize the styles by modifying the CSS file. 