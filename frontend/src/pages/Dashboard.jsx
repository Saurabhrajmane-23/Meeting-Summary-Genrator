import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
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

  // Fetch files on component mount and after successful upload
  useEffect(() => {
    fetchUserFiles();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-medium mb-4">Send Summary via Email</h3>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Meeting Summary Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                  />
                </svg>
                Upload Meeting
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center space-y-4">
            <input
              ref={fileInputRef} // Add this line
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="block w-full max-w-xs text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
            {/* Add description input field */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting description (optional)"
              className="w-full max-w-xs px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
            />
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                ${uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
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
            {/* Add this after the upload button */}
            {uploading && (
              <div className="w-full max-w-xs">
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
        </div>

        {/* Files Table */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Files</h2>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.fileName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.fileType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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