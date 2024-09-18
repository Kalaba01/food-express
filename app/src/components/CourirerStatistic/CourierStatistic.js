import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from "jwt-decode";
import ApexCharts from 'react-apexcharts';
import './CourierStatistic.css';

function CourierStatistic() {
  const { t } = useTranslation('global');
  const [activeOrders, setActiveOrders] = useState(0);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // useEffect hook fetches the courier's statistics data via WebSocket
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

   // lineOptions defines the configuration for the line chart
  const lineOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false }},
    stroke: { curve: 'smooth' },
    xaxis: { categories: [t('CourierStatistic.completedOrders')] },
    tooltip: { theme: 'dark' }
  };

  // barOptions defines the configuration for the bar chart
  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }},
    plotOptions: { bar: { horizontal: false }},
    xaxis: { categories: [t('CourierStatistic.averageRating')] },
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

  // lineSeries contains the data to be displayed on the line chart
  const lineSeries = [{ name: t('CourierStatistic.completedOrders'), data: [completedOrders] }];

   // barSeries contains the data to be displayed on the bar chart
  const barSeries = [{ name: t('CourierStatistic.averageRating'), data: [averageRating] }];

  return (
    <div className="courier-statistics-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>{t('CourierStatistic.activeOrders')}</h3>
          <p>{activeOrders}</p>
        </div>
        <div className="summary-card">
          <h3>{t('CourierStatistic.restaurantCount')}</h3>
          <p>{restaurantCount}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t('CourierStatistic.completedOrdersOverTime')}</h3>
          <ApexCharts options={lineOptions} series={lineSeries} type="line" height={350} />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t('CourierStatistic.averageRatingTitle')}</h3>
          <ApexCharts options={barOptions} series={barSeries} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}

export default CourierStatistic;
