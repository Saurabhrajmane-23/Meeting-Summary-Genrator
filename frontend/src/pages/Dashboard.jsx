// task : add process loading bar.

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import useCloudinaryUpload from '../hooks/useCloudinaryUpload';

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
    avatar: '',
    plan: 'basic',
    meetingCount: 0
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    uploadToCloudinary,
    createFileRecord,
    error: cloudinaryError,
    setError: setCloudinaryError,
  } = useCloudinaryUpload();

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
          avatar: response.data.data.avatar,
          plan: response.data.data.plan || 'basic',
          meetingCount: response.data.data.meetingCount || 0
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

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setCloudinaryError('');

      // Step 1: Upload directly to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        file,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Step 2: Create file record in database
      const fileType = file.type.split('/')[0];
      await createFileRecord({
        fileName: file.name,
        fileType: fileType,
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId,
        duration: cloudinaryResult.duration || 0,
        fileSize: cloudinaryResult.bytes || file.size,
        description: description,
      });

      // Success
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await fetchUserFiles();
      
      setFile(null);
      setDescription('');
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(
        cloudinaryError || 
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
        setProcessedFiles(prev => ({
          ...prev,
          [fileId]: {
            transcript: response.data.data.transcript,
            chapters: response.data.data.chapters,
            speakers: response.data.data.speakers,
            aiSummary: response.data.data.aiSummary
          }
        }));

        // Update meeting count immediately after processing
        setUserData(prev => ({
          ...prev,
          meetingCount: prev.meetingCount + 1
        }));
        
        await fetchUserFiles();
        
        setTimeout(() => {
          setProcessingFileId(null);
        }, 3000);
        
        alert('File processed successfully! You can now download the transcript and summary.');
      }
    } catch (error) {
      console.error('Process error:', error);
      
      if (error.response?.status === 469) {
        alert('Monthly processing limit exceeded. Please upgrade your plan to process more files.');
      } else {
        alert('Error processing file. Please try again.');
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
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          droppedFile = e.dataTransfer.items[i].getAsFile();
          break;
        }
      }
    } else {
      droppedFile = e.dataTransfer.files[0];
    }

    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);
      setError('');
      
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

  // Helper function to get plan limits
  const getPlanLimit = (plan) => {
    const limits = {
      basic: 3,
      monthly: 50,
      yearly: 100000
    };
    return limits[plan] || 3;
  };

  return (
    <div className={`min-h-screen font-[Arial] ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Responsive Navigation */}
      <nav className={`${isDarkMode ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <div className="flex items-center space-x-2 sm:space-x-6">
                  {/* User info - responsive */}
                  <div className="flex flex-col items-end">
                    <span className={`text-sm sm:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'} truncate max-w-20 sm:max-w-none`}>
                      {userData.username}
                    </span>
                  </div>
                  
                  {/* Plan Badge - responsive */}
                  <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${
                    userData.plan === 'basic' 
                      ? isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-500 text-white' : 'bg-gradient-to-r from-gray-300 to-gray-200 text-black'
                      : userData.plan === 'monthly'
                      ? isDarkMode ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isDarkMode ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    <span className="hidden sm:inline">
                      {userData.plan === 'basic' ? 'Basic Plan' : 
                       userData.plan === 'monthly' ? 'Pro Monthly' : 'Pro Yearly'}
                    </span>
                    <span className="sm:hidden">
                      {userData.plan === 'basic' ? 'Basic' : 
                       userData.plan === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                  
                  {/* Avatar - responsive */}
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="User avatar"
                      className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${isDarkMode ? 'ring-2 ring-white' : 'ring-2 ring-gray-600 ring-opacity-20'}`}
                    />
                  ) : (
                    <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${isDarkMode ? 'bg-[#00BFFF]' : 'bg-indigo-600'} flex items-center justify-center`}>
                      <span className="text-white text-xs sm:text-sm font-semibold">
                        {userData.username ? userData.username[0].toUpperCase() : 'G'}
                      </span>
                    </div>
                  )}
                  
                  {/* Hamburger menu - responsive */}
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col justify-center items-center w-5 h-5 sm:w-6 sm:h-6 focus:outline-none"
                  >
                    <div className="flex flex-col justify-between w-4 h-3 sm:w-5 sm:h-4">
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'rotate-45 translate-y-1 sm:translate-y-2' 
                            : ''
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? 'opacity-0' 
                            : 'opacity-100'
                        }`}
                      />
                      <span 
                        className={`h-0.5 w-full transform transition-all duration-300 ease-in-out ${
                          isDarkMode ? 'bg-gray-300' : 'bg-gray-600'
                        } ${
                          isDropdownOpen 
                            ? '-rotate-45 -translate-y-1 sm:-translate-y-1.5' 
                            : ''
                        }`}
                      />
                    </div>
                  </button>
                </div>
                
                {/* Enhanced Dropdown Menu - responsive */}
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-44 sm:w-48 ${
                    isDarkMode ? 'bg-gray-900/30 backdrop-blur-sm border border-gray-800' : 'bg-white'
                  } rounded-lg shadow-2xl py-1`}>
                    <div className={`px-4 py-2 flex items-center justify-between ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <span className="text-sm">Lights</span>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative w-8 h-4 sm:w-10 rounded-full transition-colors duration-200 ${
                          !isDarkMode ? 'bg-[#1e90ff]' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                            !isDarkMode ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => navigate('/plans')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Get Pro
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-gray-800' 
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

      {/* Main Content - responsive */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Upload Section - responsive */}
        <div className="px-0 py-6">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed pointer-events-auto ${
              isDarkMode ? 'border-gray-700' : 'border-gray-400'
            } ${
              isDragging ? isDarkMode ? 'bg-gray-800/50 border-[#1e90ff]' : 'bg-neutral-500 border-gray-900' : ''
            } rounded-lg h-64 sm:h-75 flex flex-col items-center justify-center space-y-4 transition-colors duration-200 mx-2 sm:mx-0`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="text-center px-4">
              <svg
                className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 ${
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
              <div className={`flex flex-wrap justify-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <label
                  htmlFor="file-upload"
                  className={`relative cursor-pointer rounded-sm font-medium ${isDarkMode ? 'text-[#1e90ff] hover:text-[#5141e1]' : 'text-indigo-600 hover:text-indigo-500'}`}
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
              <p className={`mt-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Supports audio and video files
              </p>
            </div>

            {file && (
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center px-4 break-words`}>
                Selected file: {file.name}
              </p>
            )}
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting description (optional)"
              className={`w-full max-w-xs px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-900/50 backdrop-blur-sm text-gray-200 border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300 placeholder-gray-700'
              } border rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1e90ff] focus:border-[#1e90ff] mx-4`}
              rows="2"
            />
            
            {error && (
              <div className="fixed top-4 right-4 left-4 sm:left-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-50" role="alert">
                <strong className="font-bold mr-1">Error:</strong>
                <span className="block sm:inline text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Upload Button and Progress - responsive */}
          <div className="mt-7 flex flex-col items-center px-4 sm:px-0">
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`relative inline-flex items-center px-6 py-2 border border-transparent text-sm sm:text-base font-medium rounded-md text-white
                ${uploading ? 'bg-[#1e90ff]/50 cursor-not-allowed' : isDarkMode ? 'bg-[#1e90ff] hover:bg-[#5141e1]' : 'bg-[#1e90ff] hover:bg-[#5141e1]'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e90ff]
                transition-all duration-200 w-full max-w-xs sm:w-48`}
            >
              {uploading ? (
                <div className="flex items-center justify-center w-full">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Uploading...</span>
                </div>
              ) : (
                <>
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </>
              )}
            </button>

            {uploading && (
              <div className="mt-6 w-full max-w-md px-4 sm:px-0">
                <div className="relative">
                  <div className="flex mb-3 items-center justify-between">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-[#1e90ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} truncate`}>
                        Uploading {file?.name}
                      </span>
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-[#1e90ff]' : 'text-[#1e90ff]'}`}>
                      {uploadProgress}%
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className={`overflow-hidden h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        style={{ width: `${uploadProgress}%` }}
                        className={`h-2 rounded-full ${
                          uploadProgress < 100 
                            ? 'bg-[#1e90ff]' 
                            : 'bg-green-500'
                        } transition-all duration-300 ease-out`}
                      />
                    </div>
                    {uploadProgress === 100 && (
                      <div className="absolute right-0 -top-7 transform translate-y-full">
                        <svg className="w-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Files Section Header - responsive */}
        <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0 px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Your Files
            </h2>
            
            {/* Meeting count display - responsive */}
            <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 sm:gap-2 ${
              isDarkMode 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-gray-200 text-gray-700'
            } w-fit`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"/>
              </svg>
              <span className="text-xs">
                {userData.meetingCount} / {userData.plan === 'yearly' ? '∞' : getPlanLimit(userData.plan)} processed
              </span>
            </div>
          </div>
          
          {/* Search Box - responsive */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full sm:w-64 px-4 py-1 rounded-md border text-sm ${
                isDarkMode 
                  ? 'bg-gray-900/50 backdrop-blur-sm border-gray-700 text-gray-400 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-[#1e90ff] focus:border-[#1e90ff]`}
            />
            <svg 
              className={`absolute right-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 ${
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

        {/* Files Table - responsive */}
        <div className="mt-5 px-2 sm:px-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#1e90ff] mx-auto"></div>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className={`${
              isDarkMode ? 'bg-gray-900/50 backdrop-blur-sm border border-gray-800' : 'bg-white'
            } shadow-md rounded-lg p-6 text-center`}>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>No files uploaded yet</p>
            </div>
          ) : (
            <div className={`${isDarkMode ? 'bg-gray-900/50 backdrop-blur-sm border border-gray-800' : 'bg-white'} shadow-md overflow-hidden rounded-lg`}>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {filteredFiles.map((file) => (
                  <div key={file._id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} mb-2 break-words`}>
                      {file.fileName}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {file.description || 'No description'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                      {new Date(file.createdAt).toLocaleString('en-UK', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    
                    {/* Mobile Action Buttons */}
                    <div className="flex items-center justify-start space-x-2 flex-wrap gap-2">
                      {/* Process File Button */}
                      <button
                        onClick={() => handleProcess(file._id)}
                        disabled={processingFileId === file._id || file.isProcessed}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          processingFileId === file._id || file.isProcessed
                            ? 'cursor-not-allowed opacity-50'
                            : isDarkMode
                              ? 'hover:bg-gray-700 text-blue-400 hover:text-blue-300'
                              : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                        }`}
                        title={file.isProcessed ? 'Already processed' : 'Process file'}
                      >
                        {processingFileId === file._id ? (
                          <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : file.isProcessed ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>

                                            {/* Download Transcript Button */}
                      {file.isProcessed && (
                        <div className="relative group">
                          <button
                            onClick={() => handleDownloadTranscript(file._id, file.fileName)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode
                                ? 'hover:bg-gray-700 text-green-400 hover:text-green-300'
                                : 'hover:bg-green-50 text-green-600 hover:text-green-700'
                            }`}
                            title="Download transcript"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                          }`}>
                            Download transcript
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                              isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                            }`}></div>
                          </div>
                        </div>
                      )}

                      {/* Download Summary PDF Button */}
                      {file.isProcessed && (
                        <div className="relative group">
                          <button
                            onClick={() => handleDownloadSummaryPDF(file._id, file.fileName)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode
                                ? 'hover:bg-gray-700 text-purple-400 hover:text-purple-300'
                                : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
                            }`}
                            title="Download summary PDF"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          
                          {/* Tooltip */}
                          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                          }`}>
                            Download summary PDF
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                              isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                            }`}></div>
                          </div>
                        </div>
                      )}

                      {/* Delete File Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handleDelete(file._id)}
                          disabled={deletingFileId === file._id}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            deletingFileId === file._id
                              ? 'cursor-not-allowed opacity-50'
                              : isDarkMode
                                ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                          }`}
                          title="Delete file"
                        >
                          {deletingFileId === file._id ? (
                            <svg className="animate-spin h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Tooltip */}
                        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                        }`}>
                          {deletingFileId === file._id ? 'Deleting...' : 'Delete file'}
                          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                            isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        File Name
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Description
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Size
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Date
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                    {filteredFiles.map((file) => (
                      <tr key={file._id} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div className="max-w-xs truncate">{file.fileName}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="max-w-xs truncate">{file.description || 'No description'}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(file.createdAt).toLocaleString('en-UK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Process File Button */}
                            <div className="relative group">
                              <button
                                onClick={() => handleProcess(file._id)}
                                disabled={processingFileId === file._id || file.isProcessed}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  processingFileId === file._id || file.isProcessed
                                    ? 'cursor-not-allowed opacity-50'
                                    : isDarkMode
                                      ? 'hover:bg-gray-700 text-blue-400 hover:text-blue-300'
                                      : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                                }`}
                                title={file.isProcessed ? 'Already processed' : 'Process file'}
                              >
                                {processingFileId === file._id ? (
                                  <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : file.isProcessed ? (
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                              
                              {/* Tooltip */}
                              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                                isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                              }`}>
                                {file.isProcessed ? 'Already processed' : processingFileId === file._id ? 'Processing...' : 'Process file'}
                                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                  isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                                }`}></div>
                              </div>
                            </div>

                            {/* Download Transcript Button */}
                            {file.isProcessed && (
                              <div className="relative group">
                                <button
                                  onClick={() => handleDownloadTranscript(file._id, file.fileName)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isDarkMode
                                      ? 'hover:bg-gray-700 text-green-400 hover:text-green-300'
                                      : 'hover:bg-green-50 text-green-600 hover:text-green-700'
                                  }`}
                                  title="Download transcript"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
                                
                                {/* Tooltip */}
                                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                                  isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                                }`}>
                                  Download transcript
                                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                    isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                                  }`}></div>
                                </div>
                              </div>
                            )}

                            {/* Download Summary PDF Button */}
                            {file.isProcessed && (
                              <div className="relative group">
                                <button
                                  onClick={() => handleDownloadSummaryPDF(file._id, file.fileName)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    isDarkMode
                                      ? 'hover:bg-gray-700 text-purple-400 hover:text-purple-300'
                                      : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
                                  }`}
                                  title="Download summary PDF"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                  </svg>
                                </button>
                                
                                {/* Tooltip */}
                                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                                  isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                                }`}>
                                  Download summary PDF
                                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                    isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                                  }`}></div>
                                </div>
                              </div>
                            )}

                            {/* Delete File Button */}
                            <div className="relative group">
                              <button
                                onClick={() => handleDelete(file._id)}
                                disabled={deletingFileId === file._id}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  deletingFileId === file._id
                                    ? 'cursor-not-allowed opacity-50'
                                    : isDarkMode
                                      ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                                      : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                }`}
                                title="Delete file"
                              >
                                {deletingFileId === file._id ? (
                                  <svg className="animate-spin h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                              
                              {/* Tooltip */}
                              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${
                                isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                              }`}>
                                {deletingFileId === file._id ? 'Deleting...' : 'Delete file'}
                                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                  isDarkMode ? 'border-t-gray-800' : 'border-t-gray-900'
                                }`}></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;