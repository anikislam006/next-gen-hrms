import React from 'react';

const page = () => {
  return (
    <div>
         admin dashboard
    </div>
  );
};

export default page;

// "use client";
// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Header from "@/components/Header";

// export default function Admin() {
//   const [data, setData] = useState([]);
//   useEffect(() => {
//     fetch(`https://code360.pro/api/admin/dashboard`, {
//       headers: { Authorization: `Bearer ${Cookies.get("token")}` },
//     })
//       .then((r) => r.json())
//       .then(setData);
//   }, []);
//   return (
//     <div className="">
//       {/* <Header /> */}
//       <h1 className="text-xl font-bold">Admin Dashboard</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }
