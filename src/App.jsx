import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import VariablesPage from './pages/VariablesPage';
import ModificationsPage from './pages/ModificationsPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState(null);
  const [processedFile, setProcessedFile] = useState(null);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={
              <UploadPage 
                uploadedFile={uploadedFile} 
                setUploadedFile={setUploadedFile} 
              />
            } 
          />
          <Route 
            path="/variables" 
            element={
              <VariablesPage 
                uploadedFile={uploadedFile}
                setExtractedQuestions={setExtractedQuestions}
              />
            } 
          />
          <Route 
            path="/modifications" 
            element={
              <ModificationsPage 
                uploadedFile={uploadedFile}
                questions={extractedQuestions}
                setProcessedFile={setProcessedFile}
              />
            } 
          />
          <Route 
            path="/result" 
            element={
              <ResultPage 
                processedFile={processedFile}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;