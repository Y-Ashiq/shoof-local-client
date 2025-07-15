"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Brand {
  _id: string;
  name: string;
  status: string;
  // tags: string[]; // Remove tags from interface
}

const DashboardPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [statusError, setStatusError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:3000/dashboard/brands", {
          headers: {
            "x-api-key": "MySecertAPIKey",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch brands");
        const data = await res.json();
        setBrands(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleActionChange = async (brandId: string, action: string) => {
    if (action === "delete") {
      setDeleteLoading(brandId);
      setDeleteError("");
      try {
        const res = await fetch(
          `http://localhost:3000/dashboard/brands/${brandId}`,
          {
            method: "DELETE",
            headers: {
              "x-api-key": "MySecertAPIKey",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to delete brand");
        setBrands((prev) => prev.filter((b) => b._id !== brandId));
      } catch (err: any) {
        setDeleteError(err.message || "Unknown error");
      } finally {
        setDeleteLoading(null);
      }
    } else {
      setStatusLoading(brandId);
      setStatusError("");
      try {
        const res = await fetch(
          `http://localhost:3000/dashboard/brands/${brandId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "MySecertAPIKey",
            },
            body: JSON.stringify({ status: action }),
          }
        );
        if (!res.ok) throw new Error("Failed to update status");
        const updated = await res.json();
        setBrands((prev) =>
          prev.map((b) =>
            b._id === brandId ? { ...b, status: updated.status } : b
          )
        );
      } catch (err: any) {
        setStatusError(err.message || "Unknown error");
      } finally {
        setStatusLoading(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Brands Pending Approval
        </h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="py-2 px-4 font-semibold text-gray-800 border-b border-gray-200 bg-gray-50">
                  Brand Name
                </th>
                <th className="py-2 px-4 font-semibold text-gray-800 border-b border-gray-200 bg-gray-50">
                  Status
                </th>
                {/* Remove tags column header */}
                <th className="py-2 px-4 font-semibold text-gray-800 border-b border-gray-200 bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr
                  key={brand._id}
                  className="bg-white hover:bg-purple-50 transition-colors border border-gray-200 rounded"
                >
                  <td className="py-2 px-4 text-gray-900 align-middle">
                    <Link
                      href={`/dashboard/${brand._id}`}
                      className="text-purple-700 hover:underline font-semibold"
                    >
                      {brand.name}
                    </Link>
                  </td>
                  <td className="py-2 px-4 capitalize text-gray-800 align-middle">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        brand.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : brand.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {brand.status}
                    </span>
                  </td>
                  {/* Remove tags cell */}
                  <td className="py-2 px-4 align-middle">
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-800 bg-white"
                      value={statusLoading === brand._id ? brand.status : ""}
                      onChange={(e) =>
                        handleActionChange(brand._id, e.target.value)
                      }
                      disabled={
                        statusLoading === brand._id ||
                        deleteLoading === brand._id
                      }
                    >
                      <option value="">Actions</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="pending">Pending</option>
                      <option value="delete">Delete</option>
                    </select>
                    {statusLoading === brand._id && (
                      <span className="ml-2 text-xs text-gray-400">
                        Saving...
                      </span>
                    )}
                    {deleteLoading === brand._id && (
                      <span className="ml-2 text-xs text-gray-400">
                        Deleting...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {brands.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-4">
                    No brands found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {statusError && <div className="text-red-600 mt-2">{statusError}</div>}
        {deleteError && <div className="text-red-600 mt-2">{deleteError}</div>}
      </div>
    </div>
  );
};

export default DashboardPage;
