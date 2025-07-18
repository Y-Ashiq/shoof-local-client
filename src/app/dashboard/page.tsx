"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Brand {
  _id: string;
  name: string;
  status: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [statusError, setStatusError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
  const [dashboardSearchResults, setDashboardSearchResults] = useState<Brand[]>(
    []
  );
  const [dashboardSearchLoading, setDashboardSearchLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        let url = `https://shoof-local.onrender.com/dashboard/brands?page=${page}`;
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }
        const res = await fetch(url, {
          headers: {
            "x-api-key":process.env.NEXT_PUBLIC_API_KEY||""
             ,
          },
        });
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
        let data = await res.json();
        let newBrands;
        let newTotalPages;
        if (Array.isArray(data)) {
          newBrands = data;
          newTotalPages = 1;
        } else {
          newBrands = data.brands || [];
          newTotalPages = data.totalPages || 1;
        }
        setBrands(newBrands);
        setTotalPages(newTotalPages);
      } catch (err: any) {
        console.log(err);

        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [page, statusFilter]);

  // Dashboard search effect
  useEffect(() => {
    if (!dashboardSearchQuery.trim()) {
      setDashboardSearchResults([]);
      return;
    }
    setDashboardSearchLoading(true);
    let url = `https://shoof-local.onrender.com/dashboard/brands/search?search=${encodeURIComponent(
      dashboardSearchQuery
    )}`;
    if (statusFilter !== "all") {
      url += `&status=${statusFilter}`;
    }
    fetch(url, {
      headers: {
        "x-api-key":
          "3s4SOsYJdBoMNGVf3LLKFsksm5FOnVwQsrvYbavm0Q3sNc3GEcGc5RwWp9wcYI6T",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          setUnauthorized(true);
          return Promise.reject();
        }
        return res.json();
      })
      .then((data) =>
        setDashboardSearchResults(Array.isArray(data) ? data : [])
      )
      .finally(() => setDashboardSearchLoading(false));
  }, [dashboardSearchQuery, statusFilter]);

  // Reset page to 1 when statusFilter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleActionChange = async (brandId: string, action: string) => {
    if (action === "delete") {
      setDeleteLoading(brandId);
      setDeleteError("");
      try {
        const res = await fetch(
          `https://shoof-local.onrender.com/dashboard/brands/${brandId}`,
          {
            method: "DELETE",
            headers: {
              "x-api-key":
                "3s4SOsYJdBoMNGVf3LLKFsksm5FOnVwQsrvYbavm0Q3sNc3GEcGc5RwWp9wcYI6T",
            },
          }
        );
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
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
          `https://shoof-local.onrender.com/dashboard/brands/${brandId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-api-key":
                "3s4SOsYJdBoMNGVf3LLKFsksm5FOnVwQsrvYbavm0Q3sNc3GEcGc5RwWp9wcYI6T",
            },
            body: JSON.stringify({ status: action }),
          }
        );
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }
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

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-bold text-gray-800 text-center">
          404 | Page Not Found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Brands Pending Approval
        </h1>
        {/* Status Filter Dropdown and Search */}
        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-2">
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search brands..."
            value={dashboardSearchQuery}
            onChange={(e) => setDashboardSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white w-full sm:w-64"
          />
        </div>
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
              {dashboardSearchLoading && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-4">
                    Searching...
                  </td>
                </tr>
              )}
              {(dashboardSearchQuery ? dashboardSearchResults : brands).map(
                (brand) => (
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
                )
              )}
              {(dashboardSearchQuery
                ? dashboardSearchResults.length === 0 && !dashboardSearchLoading
                : brands.length === 0 && !loading) && (
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
        {/* Pagination: hide when searching */}
        {!dashboardSearchQuery && brands.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
              disabled={page === 1 || loading}
              aria-label="Previous page"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`mx-1 px-4 py-2 rounded-full border font-bold shadow-sm ${
                  page === i + 1
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-gray-200"
                }`}
                onClick={() => setPage(i + 1)}
                disabled={loading}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full border border-black bg-white text-black font-semibold shadow-sm transition-colors duration-150 hover:bg-gray-200 disabled:opacity-50"
              onClick={() => {
                if (page < totalPages) setPage(page + 1);
              }}
              disabled={page === totalPages || loading}
              aria-label="Next page"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
