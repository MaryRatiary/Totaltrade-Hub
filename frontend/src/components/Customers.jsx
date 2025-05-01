import React from "react";
import { Bar } from "react-chartjs-2"; // Import Bar chart from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Customers = () => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "New Customers",
        data: [50, 75, 100, 125, 150, 200],
        backgroundColor: "#74B6D7",
      },
      {
        label: "Returning Customers",
        data: [30, 50, 70, 90, 110, 130],
        backgroundColor: "#28a745",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Customer Statistics",
      },
    },
  };

  return (
    <div className=" w-full h-auto">
      <div className=" flex flex-col items-center justify-center p-10 h-[500px]">
        <h1 className="text-3xl font-bold text-teal-700 mb-5">Customer Statistics</h1>
        <div className="w-full max-w-4xl bg-white p-5 rounded-lg shadow-lg">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Customers;
