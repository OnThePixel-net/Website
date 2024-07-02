"use client";
import React, { useState, useEffect } from "react";

interface ChangeLogItem {
  id: string;
  title: string;
  content: string;
  created: string;
}

function ChangeLog() {
  const [changeLogItems, setChangeLogItems] = useState<ChangeLogItem[]>([]);

  useEffect(() => {
    const cacheKey = "changeLogCache";
    const cacheExpiry = 24 * 60 * 60 * 1000;
    const fetchData = async () => {
      const response = await fetch(
        "https://pb.encryptopia.dev/api/collections/otp_changelog/records"
      );
      const data = await response.json();
      setChangeLogItems(data.items);
      const cacheData = {
        items: data.items,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    };

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { items, timestamp } = JSON.parse(cachedData);
      const isCacheValid = new Date().getTime() - timestamp < cacheExpiry;
      if (isCacheValid) {
        setChangeLogItems(items);
        return;
      }
    }
    fetchData().catch((error) =>
      console.error("Error fetching changelog:", error)
    );
  }, []);

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="changelog" className="text-3xl font-bold mb-4">
          CHANGELOG
        </h1>
        {changeLogItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#1e1e1e] p-4 my-4 border-l-4 border-green-500 rounded-lg"
          >
            <h3
              className="text-lg font-bold text-green-500"
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              {item.title}
            </h3>
            <span className="text-xs text-gray-400">
              {new Date(item.created).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <div
              className="text-sm mt-2"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChangeLog;
