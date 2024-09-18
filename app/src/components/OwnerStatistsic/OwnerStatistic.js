import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from "jwt-decode";
import ApexCharts from 'react-apexcharts';
import './OwnerStatistic.css';

function OwnerStatistic() {
  const { t } = useTranslation('global');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [preparingOrders, setPreparingOrders] = useState(0);
  const [onlineCouriers, setOnlineCouriers] = useState(0);
  const [busyCouriers, setBusyCouriers] = useState(0);
  const [offlineCouriers, setOfflineCouriers] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [ratings, setRatings] = useState(0);

  // useEffect hook for setting up the WebSocket connection and fetching owner statistics
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("JWT token not found in localStorage");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const ownerId = decodedToken.id;

      const ws = new WebSocket(`ws://localhost:8000/ws/owner-stats/${ownerId}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPendingOrders(data.pendingOrders || 0);
        setPreparingOrders(data.preparingOrders || 0);
        setOnlineCouriers(data.onlineCouriers || 0);
        setBusyCouriers(data.busyCouriers || 0);
        setOfflineCouriers(data.offlineCouriers || 0);
        setEarnings(data.earnings || 0);
        setRatings(data.ratings || 0);
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

  // Configuration for the pie chart
  const pieOptions = {
    chart: { type: 'pie', width: 380 },
    labels: [t('OwnerStatistic.onlineCouriers'), t('OwnerStatistic.busyCouriers'), t('OwnerStatistic.offlineCouriers')],
    colors: ['#34c38f', '#f7b84b', '#f46a6a'],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' }}}],
    tooltip: { theme: 'dark' }
  };

  // Configuration for the pie chart
  const lineOptions = {
    chart: { type: 'line', height: 350, toolbar: { show: false }},
    stroke: { curve: 'smooth' },
    xaxis: { categories: [t('OwnerStatistic.earnings')] },
    tooltip: { theme: 'dark' }
  };

  // Configuration for the bar chart
  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false } },
    xaxis: { categories: [t('OwnerStatistic.rating')] },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Math.round(value);
        },
      },
    },
    colors: ['#f7b84b'],
    tooltip: { theme: 'dark' }
  };  

  // Series data for the pie chart
  const pieSeries = [onlineCouriers, busyCouriers, offlineCouriers];

  // Series data for the line chart
  const lineSeries = [{ name: t('OwnerStatistic.earnings'), data: [earnings] }];

  // Series data for the bar chart
  const barSeries = [{ name: t('OwnerStatistic.rating'), data: [ratings] }];

  return (
    <div className="owner-statistics-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>{t('OwnerStatistic.pendingOrders')}</h3>
          <p>{pendingOrders}</p>
        </div>
        <div className="summary-card">
          <h3>{t('OwnerStatistic.preparingOrders')}</h3>
          <p>{preparingOrders}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t('OwnerStatistic.courierStatus')}</h3>
          <ApexCharts options={pieOptions} series={pieSeries} type="pie" width={380} />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t('OwnerStatistic.earningsOverTime')}</h3>
          <ApexCharts options={lineOptions} series={lineSeries} type="line" height={350} />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t('OwnerStatistic.restaurantRatings')}</h3>
          <ApexCharts options={barOptions} series={barSeries} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}

export default OwnerStatistic;
