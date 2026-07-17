import { useEffect, useState } from "react";
import API from "../api";

function Admin() {

  const [stats, setStats] =
    useState({});

  useEffect(() => {

    API.get("/api/admin/stats", {
      headers: {
        Authorization:
          localStorage.getItem("token"),
      },
    })
      .then((res) =>
        setStats(res.data)
      );

  }, []);

  return (
    <div style={{ padding: "30px" }}>

      <h1>Admin Dashboard</h1>

      <h3>
        Users: {stats.users}
      </h3>

      <h3>
        Products: {stats.products}
      </h3>

      <h3>
        Orders: {stats.orders}
      </h3>

      <h3>
        Revenue: ₹{stats.revenue}
      </h3>

    </div>
  );
}

export default Admin;