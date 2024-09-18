import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ApexCharts from "react-apexcharts";
import "./AdminStatistic.css";

function AdminStatistic() {
  const { t } = useTranslation("global");
  const [pendingOrders, setPendingOrders] = useState(0);
  const [preparingOrders, setPreparingOrders] = useState(0);
  const [inDeliveryOrders, setInDeliveryOrders] = useState(0);
  const [onlineCouriers, setOnlineCouriers] = useState(0);
  const [busyCouriers, setBusyCouriers] = useState(0);
  const [offlineCouriers, setOfflineCouriers] = useState(0);
  const [openRestaurants, setOpenRestaurants] = useState(0);
  const [closingSoonRestaurants, setClosingSoonRestaurants] = useState(0);
  const [closedRestaurants, setClosedRestaurants] = useState(0);

  // useEffect hook establishes a WebSocket connection to fetch real-time statistics
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

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, []);

  // Configuration for the donut chart displaying courier statuses
  const donutOptions = {
    chart: {
      type: "donut",
      width: 380,
    },
    labels: [t("AdminStatistic.onlineCouriers"), t("AdminStatistic.busyCouriers"), t("AdminStatistic.offlineCouriers")],
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

  // Configuration for the stacked bar chart displaying restaurant statuses
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
      categories: [t("AdminStatistic.restaurants")],
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

  // Data series for the stacked bar chart
  const stackedBarSeries = [
    { name: t("AdminStatistic.open"), data: [openRestaurants] },
    { name: t("AdminStatistic.closingSoon"), data: [closingSoonRestaurants] },
    { name: t("AdminStatistic.closed"), data: [closedRestaurants] },
  ];

  // Data series for the donut chart
  const donutSeries = [
    onlineCouriers || 0,
    busyCouriers || 0,
    offlineCouriers || 0,
  ];

  return (
    <div className="dashboard-container">
      <div className="summary-row">
        <div className="summary-card">
          <h3>{t("AdminStatistic.pendingOrders")}</h3>
          <p>{pendingOrders}</p>
        </div>
        <div className="summary-card">
          <h3>{t("AdminStatistic.preparingOrders")}</h3>
          <p>{preparingOrders}</p>
        </div>
        <div className="summary-card">
          <h3>{t("AdminStatistic.inDelivery")}</h3>
          <p>{inDeliveryOrders}</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>{t("AdminStatistic.courierStatus")}</h3>
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
          <h3>{t("AdminStatistic.restaurantStatus")}</h3>
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
