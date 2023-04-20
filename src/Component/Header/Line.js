import React from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

const options = {
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        lineWidth: 0,
        offset: false
      }
    },
    y: {
      grid: {offset: true},
    }
  },
  responsive: true
}

const LineChart = ({data}) => {
    return (
      <Line data={data} options={options} />
    )
}

export default LineChart;