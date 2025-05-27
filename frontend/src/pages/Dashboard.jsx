import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // Add this import at the top

function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [processingFileId, setProcessingFileId] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [selectedFileForEmail, setSelectedFileForEmail] = useState(null);
  const [processedFiles, setProcessedFiles] = useState({});
  const [userData, setUserData] = useState({
    username: '',
    avatar: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  // Add function to fetch user's files
  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v2/files', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        setFiles(response.data.data);
        // Set processed files state based on isProcessed flag
        const processed = {};
        response.data.data.forEach(file => {
          if (file.isProcessed) {
            processed[file._id] = {
              transcript: file.transcript,
              aiSummary: file.aiSummary,
              isAnalyzed: file.isAnalyzed
            };
          }
        });
        setProcessedFiles(processed);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v2/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        setUserData({
          username: response.data.data.username,
          avatar: response.data.data.avatar
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch files and user data on component mount and after successful upload
  useEffect(() => {
    fetchUserFiles();
    fetchUserData();
  }, []);

  // Add this with other useEffect hooks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file before uploading');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await axios.post('http://localhost:8000/api/v2/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.min(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
            99
          );
          setUploadProgress(percentCompleted);
        },
        timeout: 300000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });

      if (response.data?.success) {
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add this: Fetch updated files list immediately
        await fetchUserFiles();
        
        setFile(null);
        setDescription('');
        setError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error.response || error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Error uploading file. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // function to handle processing
  const handleProcess = async (fileId) => {
    try {
      setProcessingFileId(fileId);
      const response = await axios.post(
        `http://localhost:8000/api/v2/files/process/${fileId}`, 
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data?.success) {
        // Store both transcript and summary data in state
        setProcessedFiles(prev => ({
          ...prev,
          [fileId]: {
            transcript: response.data.data.transcript,
            chapters: response.data.data.chapters,
            speakers: response.data.data.speakers,
            aiSummary: response.data.data.aiSummary
          }
        }));
        
        // Refresh files list
        await fetchUserFiles();
        
        alert('File processed successfully! You can now download the transcript and summary.');
      }
    } catch (error) {
      console.error('Process error:', error);
      alert('Error processing file');
    } finally {
      setProcessingFileId(null);
    }
  };

  // delete handler function
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setDeletingFileId(fileId);
      const response = await axios.delete(
        `http://localhost:8000/api/v2/files/delete/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.data?.success) {
        // Remove file from state
        setFiles(files.filter(file => file._id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  // downloading the transcript
  const handleDownloadTranscript = (fileId, fileName) => {
    const processedFile = processedFiles[fileId];
    if (!processedFile?.transcript) {
      alert('No transcript available. Please process the file first.');
      return;
    }

    const transcriptBlob = new Blob([processedFile.transcript], { type: 'text/plain' });
    const downloadUrl = window.URL.createObjectURL(transcriptBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `transcript_${fileName}.txt`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleDownloadSummaryPDF = async (fileId, fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v2/files/summary/${fileId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(error.response?.data?.message || 'Error downloading summary PDF. Please make sure the file has been processed and has a summary.');
    }
  };

  const handleEmailSummary = async () => {
    try {
      if (!emailAddress || !selectedFileForEmail) return;

      await axios.post(
        `http://localhost:8000/api/v2/files/summary/${selectedFileForEmail}/email`,
        { email: emailAddress },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      alert('Summary sent to email successfully!');
      setShowEmailModal(false);
      setEmailAddress('');
      setSelectedFileForEmail(null);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending summary email');
    }
  };

  // Add this component inside Dashboard but before the return statement
  const EmailModal = () => {
    if (!showEmailModal) return null;

    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-600'} bg-opacity-50 flex items-center justify-center`}>
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg p-6 w-96`}>
          <h3 className={`text-lg font-medium mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Send Summary via Email
          </h3>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="Enter email address"
            className={`w-full px-3 py-2 border rounded-md mb-4 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowEmailModal(false);
                setEmailAddress('');
                setSelectedFileForEmail(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleEmailSummary}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update these drag and drop event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const items = e.dataTransfer.items;
    if (items?.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x < rect.left ||
      x >= rect.right ||
      y < rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    let droppedFile;
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          droppedFile = e.dataTransfer.items[i].getAsFile();
          break;
        }
      }
    } else {
      // Use DataTransfer interface
      droppedFile = e.dataTransfer.files[0];
    }

    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);
      setError('');
      
      // Create a new DataTransfer object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    } else {
      setError('Please drop an audio or video file');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navigation Header */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-6">
                  <span className={`text-2xl  ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    {userData.username}
                  </span>
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="User avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {userData.username ? userData.username[0].toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  {/* Replace the existing dropdown button and svg with this new animated version */}
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col justify-center items-center w-6 h-6 focus:outline-none"
                  >
                    <div className="flex flex-col justify-between w-5 h-4">
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'rotate-45 translate-y-2' 
                            : ''
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'opacity-0' 
                            : 'opacity-100'
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-white' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? '-rotate-45 -translate-y-1.5' 
                            : ''
                        }`}
                      />
                    </div>
                  </button>
                </div>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } rounded-md shadow-lg py-1`}>
                    {/* Add theme toggle before logout */}
                    <div className={`px-4 py-2 flex items-center justify-between ${
                      isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <span className="text-sm">Lights</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative w-10 h-4 rounded-full transition-colors duration-200 ${
                          isDarkMode ? 'bg-gray-600' : 'bg-blue-500'
                        }`}
                      >
                        <div
                          className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            isDarkMode ? 'translate-x-0.5' : 'translate-x-6'
                          }`}
                        />
                      </button>
                    </div>
                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed pointer-events-auto ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } ${
              isDragging ? 'bg-indigo-50 border-indigo-500' : ''
            } rounded-lg h-96 flex flex-col items-center justify-center space-y-4 transition-colors duration-200`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="text-center">
              <svg
                className={`mx-auto h-12 w-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <span>Select a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="audio/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
            </div>

            {file && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Selected file: {file.name}
              </p>
            )}
            
            {/* Description textarea */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting description (optional)"
              className={`w-full max-w-xs px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-200 border-gray-700' 
                  : 'bg-white text-gray-700 border-gray-300'
              } border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              rows="2"
            />
            
            {error && (
              <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50" role="alert">
                <strong className="font-bold mr-1">Error:</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`inline-flex items-center mt-3 px-6 py-2 border border-transparent text-base font-medium rounded-md text-white
                ${uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-colors duration-200`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </>
              )}
            </button>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mt-4 w-full max-w-md mx-auto">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      Uploading
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Files Table */}
        <div className="mt-5">
          <h2 className={`text-lg font-semibold mb-4 ${
  isDarkMode ? 'text-gray-200' : 'text-gray-800'
}`}>
  Your Files
</h2>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500">No files uploaded yet</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded At
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200'
                }`}>
                  {files.map((file) => (
                    <tr key={file._id} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {file.fileName}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {file.description || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {new Date(file.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleProcess(file._id)}
                          className={`text-indigo-600 hover:text-indigo-900 ${
                            processingFileId === file._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={processingFileId === file._id}
                        >
                          {processingFileId === file._id ? 'Processing...' : 'Process'}
                        </button>
                        
                        {file.isProcessed && (
                          <>
                            <button
                              onClick={() => handleDownloadTranscript(file._id, file.fileName)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download Transcript
                            </button>

                            <button
                              onClick={() => handleDownloadSummaryPDF(file._id, file.fileName)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Download Summary
                            </button>

                            <button
                              onClick={() => {
                                setSelectedFileForEmail(file._id);
                                setShowEmailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Email Summary
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(file._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deletingFileId === file._id}
                        >
                          {deletingFileId === file._id ? (
                            <span className="inline-flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <EmailModal />
    </div>
  );
}

export default Dashboard;