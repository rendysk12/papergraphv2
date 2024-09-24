import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './NodePopup.css';

const NodePopup = ({
  node,
  onClose,
  onDelete,
  onSearchMore,
  onSearchCitation,
  handleClickBackGround,
  onSimilarPaper,
  paperDetail
}) => {
  // Hooks must be called unconditionally, outside of any return statement
  const [showNotFound, setShowNotFound] = useState(false);

  const isCitationDisabled = node && node.database === 1;
 // Reset `showNotFound` when the `node` changes
 useEffect(() => {
  setShowNotFound(false);
}, [node]);

  useEffect(() => {
    if (!paperDetail || !paperDetail.abstract) {
      const timer = setTimeout(() => {
        setShowNotFound(true);
      }, 1500); // 5 second delay

      return () => clearTimeout(timer); // Clean up the timer
    } else {
      setShowNotFound(false); // Reset state if abstract is present
    }
  }, [paperDetail]);

  // If node is not available, return null after hooks have been called
  if (!node) return null;

  return (
    <div className="popupDataPaper fixed inset-0 flex justify-center items-center z-50">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={handleClickBackGround}></div>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full relative pop-background">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h2 className="title text-2xl font-semibold mb-4 text-center">{node.label}</h2>

        {/* Abstract Section */}
        <div className="mb-4 abstract-section">
          
          <h3 className="abstract-title text-lg font-medium text-gray-700">Abstract:</h3>
          <div className="abstract-content">
            {paperDetail && paperDetail.abstract ? (
              <p className="text-gray-600 leading-relaxed">{paperDetail.abstract}</p>
            ) : (
              showNotFound && (
                <p className="text-gray-600 leading-relaxed">Abstract not found....</p>
              )
            )}
          </div>
        </div>




        <div className="class-button flex justify-between space-x-2">
          <button 
            className="btn bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
            onClick={onSearchMore}
          >
            Search Paper
          </button>
          <button 
            className={`btn px-4 py-2 rounded-lg w-full text-white transition ${
              isCitationDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={onSearchCitation} 
            disabled={isCitationDisabled}
          >
            Citation 
          </button>
          <button 
            className="btn bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
            onClick={onSimilarPaper}
          >
            Similar Paper
          </button>
          <button 
            className="btn bg-red-500 text-white px-4 py-2 rounded-lg w-full hover:bg-red-600 transition"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePopup;
