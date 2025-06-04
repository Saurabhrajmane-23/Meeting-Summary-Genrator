// task : add process loading bar.


import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

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
  const [processedFiles, setProcessedFiles] = useState({});
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://meeting-summary-genrator.onrender.com/api/v2/files', {
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

  const fetchUserData = async () => {
    try {
      const response = await axios.get('https://meeting-summary-genrator.onrender.com/api/v2/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        setUserData({
          username: response.data.data.username,
          email: response.data.data.email,
          avatar: response.data.data.avatar
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserFiles();
    fetchUserData();
  }, []);

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
      const response = await axios.post('https://meeting-summary-genrator.onrender.com/api/v2/files/upload', formData, {
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

  const handleProcess = async (fileId) => {
    try {
      setProcessingFileId(fileId);
      const response = await axios.post(
        `https://meeting-summary-genrator.onrender.com/api/v2/files/process/${fileId}`, 
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
      if (error.response?.status === 469) {
        alert('Monthly processing limit exceeded. Please upgrade your plan to process more files.');
      }
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setDeletingFileId(fileId);
      const response = await axios.delete(
        `https://meeting-summary-genrator.onrender.com/api/v2/files/delete/${fileId}`,
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

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

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
        `https://meeting-summary-genrator.onrender.com/api/v2/files/summary/${fileId}/pdf`,
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

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ); 

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete('https://meeting-summary-genrator.onrender.com/api/v2/users/delete-account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.data?.success) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navigation Header */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Summary Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-6">
                  <span className={`text-2xl  ${isDarkMode ? 'text-white bg-gray-800' : 'text-black bg-white'}`}>
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
                  } rounded-sm shadow-lg py-1`}>
                    {/* Theme toggle */}
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

                    {/* payment button */}
                    <button
                      onClick={() => navigate('/plans')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Get Pro
                    </button>

                    {/* Delete Account button */}
                    <button
                      onClick={handleDeleteAccount}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-gray-700' 
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      Delete Account
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
              isDarkMode ? 'border-gray-700' : 'border-gray-400'
            } ${
              isDragging ? 'bg-neutral-500 border-gray-900' : ''
            } rounded-lg h-75 flex flex-col items-center justify-center space-y-4 transition-colors duration-200`}
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
                    className="relative cursor-pointer rounded-sm font-medium text-indigo-600 hover:text-indigo-500"
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
              } border rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              rows="2"
            />
            
            {error && (
              <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50" role="alert">
                <strong className="font-bold mr-1">Error:</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>

          {/* Upload Button and Progress */}
          <div className="mt-7 flex flex-col items-center">
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`relative inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white
                ${uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-all duration-200 w-48`}
            >
              {uploading ? (
                <div className="flex items-center justify-center w-full">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Uploading...</span>
                </div>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </>
              )}
            </button>

            {/* Enhanced Progress Bar */}
            {uploading && (
              <div className="mt-6 w-full max-w-md">
                <div className="relative">
                  <div className="flex mb-3 items-center justify-between">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Uploading {file?.name}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {uploadProgress}%
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className={`overflow-hidden h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className={`h-2 rounded-full ${
                          uploadProgress < 100 
                            ? 'bg-indigo-500' 
                            : 'bg-green-500'
                        } transition-all duration-300 ease-out`}
                      />
                    </div>
                    {uploadProgress === 100 && (
                      <div className="absolute right-0 -top-7 transform translate-y-full">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {uploadProgress < 100 
                      ? 'Please wait while your file is being uploaded...'
                      : 'Upload complete! Processing will begin shortly...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files Table */}
        {/* Files Table Header */}
        <div className="mt-5 flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${
  isDarkMode ? 'text-gray-200' : 'text-gray-800'
}`}>
  Your Files
</h2>
  
  <div className="relative">
    <input
      type="text"
      placeholder="Search files..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-64 px-4 py-1 rounded-md border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400' 
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
    />
    <svg 
      className={`absolute right-3 top-2.5 h-5 w-5 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path 
        fillRule="evenodd" 
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
        clipRule="evenodd" 
      />
    </svg>
  </div>
</div>

        <div className="mt-5">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className={`${
    isDarkMode ? 'bg-gray-800' : 'bg-white'
  } shadow-md rounded-lg p-6 text-center`}>
    <p className={`${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>No files uploaded yet</p>
  </div>
          ) : (
            <div className="bg-white shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      File Name
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Description
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Size
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Uploaded At
                    </th>
                    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200'
                }`}>
                  {filteredFiles.map((file) => (
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
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(file.createdAt).toLocaleString('en-UK', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleProcess(file._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-200 ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } ${
                            processingFileId === file._id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={processingFileId === file._id}
                          title="Process file"
                        >
                          {processingFileId === file._id ? (
                            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
                          ) : (
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        
                        {file.isProcessed && (
                          <>
                            <button
                              onClick={() => handleDownloadTranscript(file._id, file.fileName)}
                              className={`p-2 rounded-full transform hover:scale-110 transition-all duration-200 ${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                              title="Download transcript"
                            >
                              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDownloadSummaryPDF(file._id, file.fileName)}
                              className={`p-2 rounded-full transform hover:scale-110 transition-all duration-200 ${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                              }`}
                              title="Download summary PDF"
                            >
                              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(file._id)}
                          className={`p-2 rounded-full transform hover:scale-110 transition-all duration-200 ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                          disabled={deletingFileId === file._id}
                          title="Delete file"
                        >
                          {deletingFileId === file._id ? (
                            <svg className="animate-spin h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
                          ) : (
                            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
    </div>
  );
}

export default Dashboard;