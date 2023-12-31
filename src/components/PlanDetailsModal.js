import React, { useState, useEffect } from 'react';
import './PlanDetailsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import CleanerDetails from './CleanerDetails';
import { faTshirt, faHome, faTree } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const PlanDetailsModal = ({ selectedPlan, onClose }) => {
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [availableCleaners, setAvailableCleaners] = useState([]);

  const planDetails = {
    Bronze: {
      planName: 'Bronze Plan',
      price: 'ksh.950',
      tasks: ['Gardening', 'Laundry', 'House Cleaning'],
      description: 'Choose one task for the cleaners to do.',
      maxTasksSelectable: 1,
    },
    Silver: {
      planName: 'Silver Plan',
      price: 'ksh.1800',
      tasks: ['Gardening', 'Laundry', 'House Cleaning'],
      description: 'Choose two tasks for the cleaners to do.',
      maxTasksSelectable: 2,
    },
    Gold: {
      planName: 'Gold Plan',
      price: 'ksh.2500',
      tasks: ['Gardening', 'Laundry', 'House Cleaning'],
      description: 'Choose three tasks for the cleaners to do.',
      maxTasksSelectable: 3,
    },
  };
  const { planName, tasks, description, maxTasksSelectable } = planDetails[selectedPlan];

  useEffect(() => {
    fetch('https://neatly-api.onrender.com/cleaners')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setAvailableCleaners(data); // Assuming your API response contains a list of cleaner objects.
      })
      .catch(error => {
        console.error('Error fetching cleaners:', error);
      });
  }, []);

  const handleCleanerDetails = (cleaner) => {
    setSelectedCleaner(cleaner === selectedCleaner ? null : cleaner);
  };

  const handleCleanerSelect = (cleaner) => {
    setSelectedCleaner(cleaner);
    console.log("selected cleaner:", cleaner);
  };

  const handleCleanerClick = (cleaner) => {
    setSelectedCleaner(cleaner);
  };

  const handleBackToPlanDetails = () => {
    setSelectedCleaner(null);
  };


  const handleSubmit = () => {
    const request_data = {
      task_one: selectedTasks[0],
      task_two: selectedTasks[1],
      task_three: selectedTasks[2],
      user_id: localStorage.getItem('userId'),
      cleaner_id: selectedCleaner.id
    };

    console.log('Request Data:', request_data);

    fetch('https://neatly-api.onrender.com/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request_data)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Server Response:', data);
        swal("Good job!", "Your plan request has been sent to the cleaner!", "success");
        onClose();
      })
      .catch(error => {
        console.error('Error creating request:', error);
        swal("Oops!", "Something went wrong, please try again!", "error");
      });
  };



  const renderStars = (rating) => {
    const totalStars = 5;
    const filledStars = Math.round(rating * 2) / 2;
    const starIcons = Array.from({ length: totalStars }, (_, index) => {
      if (index + 0.5 <= filledStars) {
        return <FontAwesomeIcon key={index} icon={faStar} className="star filled-star" />;
      } else if (index < filledStars) {
        return <FontAwesomeIcon key={index} icon={faStarHalfAlt} className="star half-star" />;
      } else {
        return <FontAwesomeIcon key={index} icon={faStar} className="star empty-star" />;
      }
    });
    return starIcons;
  };

  const handleTaskSelect = (task) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(prevSelectedTasks => prevSelectedTasks.filter(t => t !== task));
    } else if (selectedTasks.length < maxTasksSelectable) {
      setSelectedTasks(prevSelectedTasks => [...prevSelectedTasks, task]);
    }
  };

  return (
    <div className="plan-details-modal">
      <div className="modal-content">
        <FontAwesomeIcon icon={faTimes} className="close-button" onClick={onClose} />
        <h2>{planName}</h2>

        {selectedCleaner ? (
          <CleanerDetails cleaner={selectedCleaner} onBack={handleBackToPlanDetails} />
        ) : (
          <div className="details-modal">
            <div className="tasks-section">
              <h3 className="task-head">Select {maxTasksSelectable} Task{maxTasksSelectable > 1 && 's'}:</h3>
              <ul className="tasks">
                {tasks.map((task, index) => (
                  <li key={index}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task)}
                        onChange={() => handleTaskSelect(task)}
                        disabled={selectedTasks.length >= maxTasksSelectable && !selectedTasks.includes(task)}
                      />
                      {task === 'Laundry' && <FontAwesomeIcon icon={faTshirt} className="task-icon" />}
                      {task === 'House Cleaning' && <FontAwesomeIcon icon={faHome} className="task-icon" />}
                      {task === 'Gardening' && <FontAwesomeIcon icon={faTree} className="task-icon" />}
                      {task}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <p className="description1">
              <br />
              For this plan you are only allowed to choose {maxTasksSelectable} Task
              {maxTasksSelectable > 1 && 's'} for the cleaners to do. The tasks are not limited to one choice but you can
              select any variations.
            </p>
            <h3>Available Cleaners:</h3>
            <div className="search-bar">
  <input
    type="text"
    placeholder="Search for cleaners..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
<div className="cleaners-section">
  <ul>
    {availableCleaners
      .filter((cleaner) =>
        cleaner.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((cleaner, index) => (
      <li
        key={index}
        className={`cleaner-item ${selectedCleaner === cleaner ? 'selected' : ''}`}
        onClick={() => handleCleanerSelect(cleaner)}
      >
        <div className={`cleaner-name ${selectedCleaner === cleaner ? 'selected' : ''}`}>
          {cleaner.name}
        </div>
        <div className="cleaner-rating">{renderStars(cleaner.rating)}</div>
        <button onClick={() => handleCleanerDetails(cleaner)}>View Details</button>
      </li>
    ))}
  </ul>
</div>

          </div>
        )}

        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default PlanDetailsModal;