import React, { useEffect, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import { jwtDecode } from 'jwt-decode';
import './CourierStatistic.css';

function CourierStatistic() {
  const [activeOrders, setActiveOrders] = useState(0);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("JWT token not found in localStorage");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      const ws = new WebSocket(`ws://localhost:8000/ws/courier-stats/${userId}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setActiveOrders(data.activeOrders || 0);
        setRestaurantCount(data.restaurantCount || 0);
        setCompletedOrders(data.completedOrders || 0);
        setAverageRating(data.averageRating || 0);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
      };

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      return () => {
        clearInterval(pingInterval);
        ws.close();
      };
    } catch (error) {
      console.error("Invalid JWT token", error);
    }
  }, []);

  const lineOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false }},
    stroke: { curve: 'smooth' },
    xaxis: { categories: ['Completed Orders'] },
    tooltip: { theme: 'dark' }
  };

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }},
    plotOptions: { bar: { horizontal: false }},
    xaxis: { categories: ['Rating'] },
    colors: ['#f7b84b'],
    tooltip: { theme: 'dark' },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value * 100) / 100;
        },
      },
    },
  };

  const lineSeries = [{ name: 'Completed Orders', data: [completedOrders] }];
  const barSeries = [{ name: 'Average Rating', data: [averageRating] }];

  return (
    <div className="courier-statistics-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>Active Orders</h3>
          <p>{activeOrders}</p>
        </div>
        <div className="summary-card">
          <h3>Restaurant Count</h3>
          <p>{restaurantCount}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Completed Orders Over Time</h3>
          <ApexCharts options={lineOptions} series={lineSeries} type="line" height={350} />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Average Rating</h3>
          <ApexCharts options={barOptions} series={barSeries} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}

export default CourierStatistic;
