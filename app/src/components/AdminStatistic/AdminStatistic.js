import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import "./AdminStatistic.css";

function AdminStatistic() {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [preparingOrders, setPreparingOrders] = useState(0);
  const [inDeliveryOrders, setInDeliveryOrders] = useState(0);
  const [onlineCouriers, setOnlineCouriers] = useState(0);
  const [busyCouriers, setBusyCouriers] = useState(0);
  const [offlineCouriers, setOfflineCouriers] = useState(0);
  const [openRestaurants, setOpenRestaurants] = useState(0);
  const [closingSoonRestaurants, setClosingSoonRestaurants] = useState(0);
  const [closedRestaurants, setClosedRestaurants] = useState(0);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/admin-stats");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPendingOrders(data.pendingOrders || 0);
      setPreparingOrders(data.preparingOrders || 0);
      setInDeliveryOrders(data.inDeliveryOrders || 0);
      setOnlineCouriers(data.onlineCouriers || 0);
      setBusyCouriers(data.busyCouriers || 0);
      setOfflineCouriers(data.offlineCouriers || 0);
      setOpenRestaurants(data.openRestaurants || 0);
      setClosingSoonRestaurants(data.closingSoonRestaurants || 0);
      setClosedRestaurants(data.closedRestaurants || 0);
    };

    return () => ws.close();
  }, []);

  const donutOptions = {
    chart: {
      type: "donut",
      width: 380,
    },
    labels: ["Online Couriers", "Busy Couriers", "Offline Couriers"],
    colors: ["#34c38f", "#556ee6", "#f46a6a"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: { theme: "dark" },
  };

  const stackedBarOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      categories: ["Restaurants"],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return Number.isInteger(value) ? value : "";
        },
      },
    },
    colors: ["#34c38f", "#f7b84b", "#f46a6a"],
    tooltip: { theme: "dark" },
  };

  const stackedBarSeries = [
    { name: "Open", data: [openRestaurants] },
    { name: "Closing Soon", data: [closingSoonRestaurants] },
    { name: "Closed", data: [closedRestaurants] },
  ];

  const donutSeries = [
    onlineCouriers || 0,
    busyCouriers || 0,
    offlineCouriers || 0,
  ];

  return (
    <div className="dashboard-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>Pending Orders</h3>
          <p>{pendingOrders}</p>
        </div>
        <div className="summary-card">
          <h3>Preparing Orders</h3>
          <p>{preparingOrders}</p>
        </div>
        <div className="summary-card">
          <h3>In Delivery</h3>
          <p>{inDeliveryOrders}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Courier Status</h3>
          <ApexCharts
            options={donutOptions}
            series={donutSeries}
            type="donut"
            width={380}
          />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Restaurant Status</h3>
          <ApexCharts
            options={stackedBarOptions}
            series={stackedBarSeries}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminStatistic;
