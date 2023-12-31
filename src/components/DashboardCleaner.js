import React, { useState, useEffect } from "react";
import "./DashboardCleaner.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";


const CleanerDashboard = () => {
  const navigate = useNavigate();
  const [clickedRequestId, setClickedRequestId] = useState(null);


  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch(`https://neatly-api.onrender.com/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the request status in the state
        setCleanerProfile((prevProfile) => ({
          ...prevProfile,
          requests: prevProfile.requests.map((request) =>
            request.id === requestId
              ? { ...request, status: newStatus }
              : request
          ),
        }));
      } else {
        console.error("Failed to update request status");
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const [cleanerProfile, setCleanerProfile] = useState({
    name: "",
    description: "",
    rating: 0,
    requests: [],
    reviews: [],
    image_url: "",
  });

  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const cleanerId = localStorage.getItem("cleanerid");

    if (cleanerId) {
      fetch(`https://neatly-api.onrender.com/cleaners/${cleanerId}`)
        .then((response) => response.json())
        .then((data) => {
          setCleanerProfile({
            name: data.name || "",
            description: data.description || "",
            rating: data.rating || 0,
            requests: data.requests || [],
            reviews: data.reviews || [],
            image_url: data.image_url || "",
          });

          const tempUserMap = {};

          const promises = [
            ...data.reviews.map((review) =>
              fetch(`/users/${review.user_id}`)
                .then((response) => response.json())
                .then((userData) => {
                  tempUserMap[review.user_id] = userData.name || "";
                })
            ),
            ...data.requests.map((request) =>
              fetch(`/users/${request.user_id}`)
                .then((response) => response.json())
                .then((userData) => {
                  tempUserMap[request.user_id] = userData.name || "";
                })
            ),
          ];

          Promise.all(promises).then(() => {
            setUserMap(tempUserMap);
            console.log("User Map:", tempUserMap);
          });

          console.log("Fetched Cleaner Data:", data);
        })
        .catch((error) => {
          console.error("Error fetching cleaner data:", error);
        });
    }
  }, []);

  // Calculate the average rating
  const calculateAverageRating = () => {
    if (cleanerProfile.reviews.length === 0) {
      return 0;
    }

    const totalRating = cleanerProfile.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return totalRating / cleanerProfile.reviews.length;
  };

  const averageRating = calculateAverageRating();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStar} className="star full-star" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon
          key={fullStars}
          icon={faStar}
          className="star half-star"
        />
      );
    }

    return stars;
  };

  const chartData = {
    labels: ["Requests", "Reviews"],
    datasets: [
      {
        label: "Count",
        backgroundColor: ["#3498db", "#e74c3c"], // Colors for bars
        data: [cleanerProfile.requests.length, cleanerProfile.reviews.length],
      },
    ],
  };

  

  return (
    <div className="cover">
      <div className="cleaner-dashboard">
      <button className="back-button" onClick={() => navigate("/landing")}>
  <FontAwesomeIcon icon={faArrowLeft} /> 
</button>

        <div className="profile">
          <div className="profile-image-container">
            <img
              src={cleanerProfile.image_url}
              alt="profile"
              className="profile-image"
            />
          </div>
          <div className="user-info">
            <h1>{cleanerProfile.name}</h1>
            <p>{cleanerProfile.description}</p>
            <h1 className="rating-stars">
              Rating:{renderStars(averageRating)}
            </h1>
          </div>
        </div>
        <div className="dashboard-section cleaner-profile">
          <div className="average-rating-container">
            <div className="circle">
              <div className="outer-circle">
                <div className="inner-circle">{averageRating.toFixed(2)}</div>
              </div>
              <p>Average Rating</p>
            </div>
            <div className="circle">
              <div className="outer-circle">
                <div className="inner-circle">
                  {cleanerProfile.requests.length}
                </div>
              </div>
              <p>Number of Requests</p>
            </div>
            <div className="circle">
              <div className="outer-circle">
                <div className="inner-circle">
                  {cleanerProfile.reviews.length}
                </div>
              </div>
              <p>Number of Reviews</p>
            </div>
          </div>
        </div>

        <div className="boxes">
          <div className="dashboard-section notifications">
            <h3 className="request-title">Requests</h3>
            <table className="table-request">
              <thead>
                <tr>
                  <th className="name-column">Name</th>
                  <th className="centered-column">Tasks</th>
                  <th className="status-column">Response</th>
                </tr>
              </thead>
              <tbody>
                {cleanerProfile.requests
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort requests from newest to oldest
                  .map((request) => (
                    <tr
                    className={`request ${
                      clickedRequestId === request.id ? "active" : ""
                    }`}
                    key={request.id}
                  >
                    <td className="name-column">{userMap[request.user_id]}</td>
                    <td className="centered-column tasks-column">
                      {request.task_one}
                      {request.task_two}
                      {request.task_three}
                    </td>
                    <td className="stato">
                          {request.status}
                          {clickedRequestId !== request.id && (
                            <button
                              onClick={() => {
                                handleStatusUpdate(request.id, "accepted");
                                setClickedRequestId(request.id); // Update the clicked request ID
                              }}
                              disabled={clickedRequestId !== null}
                            >
                              Accept
                            </button>
                          )}
                          {clickedRequestId !== request.id && (
                            <button
                              onClick={() => {
                                handleStatusUpdate(request.id, "denied");
                                setClickedRequestId(request.id); // Update the clicked request ID
                              }}
                              disabled={clickedRequestId !== null}
                            >
                              Deny
                            </button>
                          )}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-section reviews">
              <h3>Reviews</h3>
              {cleanerProfile.reviews
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort reviews from newest to oldest
                .map((review) => (
              <div key={review.id} className="review">
                <blockquote>
                  {" "}
                  <p>{review.review}</p>
                </blockquote>

                <div className="stars">
                  {Array.from(Array(Math.floor(review.rating))).map(
                    (_, index) => (
                      <FontAwesomeIcon
                        key={index}
                        icon={faStar}
                        className="star full-star"
                      />
                    )
                  )}
                  {review.rating % 1 !== 0 && (
                    <FontAwesomeIcon icon={faStar} className="star half-star" />
                  )}
                </div>
                <cite>
                  <p> by: ~{userMap[review.user_id]}</p>
                </cite>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanerDashboard;
