"use client";

import { useEffect, useState } from "react";

export default function Toast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (!token) setMessage("Вы не авторизованы");
  }, []);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded shadow z-50">
      {message}
    </div>
  );
}
