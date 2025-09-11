"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/popup/PopupContext";
import { apiGet } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export default function EmployeeReportPage() {
  const router = useRouter();
  const { popupMessage } = usePopup();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(formatDateLocal(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDateLocal(today));
  const [username, setUsername] = useState("");
  const [allServices, setAllServices] = useState<
    { service_id: number; service_name: string }[]
  >([]);

  const headerContainerRef = useRef<HTMLDivElement | null>(null);
  const bodyContainerRef = useRef<HTMLDivElement | null>(null);
  const headerScrollRef = useRef<HTMLDivElement | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const leftFixedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const allServicesTemp: { service_id: number; service_name: string }[] = [];
    data.forEach((emp) => {
      emp.services_report?.forEach((srv: any) => {
        if (!allServicesTemp.find((s) => s.service_id === srv.service_id)) {
          allServicesTemp.push({
            service_id: srv.service_id,
            service_name: srv.service_name,
          });
        }
      });
    });

    setAllServices(allServicesTemp);
  }, [data]);

  // setup table
  useLayoutEffect(() => {
    if (
      !headerContainerRef.current ||
      !bodyContainerRef.current ||
      !allServices ||
      allServices.length === 0
    )
      return;

    // Lấy tất cả row body fixed
    const columnsBodyFixed =
      bodyContainerRef.current.querySelectorAll<HTMLDivElement>(
        "[data-row-fixed] > div"
      );
    if (columnsBodyFixed.length === 0) return;

    // Lấy tất cả row body scroll
    const columnsBodyScroll =
      bodyContainerRef.current.querySelectorAll<HTMLDivElement>(
        "[data-row-scroll] > div"
      );
    if (columnsBodyScroll.length === 0) return;

    // lấy tất cả column header fixed
    const columnsHeaderFixed =
      headerContainerRef.current.querySelectorAll<HTMLDivElement>(
        "[data-header-fixed] > div"
      );

    // lấy tất cả column header scroll
    const columnsHeaderScroll =
      headerContainerRef.current.querySelectorAll<HTMLDivElement>(
        "[data-header-scroll] > div"
      );

    // set width fixed area
    columnsBodyFixed.forEach((columnBody, index) => {
      const columnHeader =
        columnsHeaderFixed[index % columnsHeaderFixed.length];
      const width = Math.max(
        columnBody.getBoundingClientRect().width,
        columnHeader.getBoundingClientRect().width
      );

      columnHeader.style.width = `${width}px`;
      columnBody.style.width = `${width}px`;
    });

    // set width scroll area
    columnsBodyScroll.forEach((columnBody, index) => {
      const columnHeader =
        columnsHeaderScroll[index % columnsHeaderScroll.length];
      const width = Math.max(
        columnBody.getBoundingClientRect().width,
        columnHeader.getBoundingClientRect().width
      );
      columnHeader.style.width = `${width}px`;
      columnBody.style.width = `${width}px`;
    });
  }, [allServices]);

  useEffect(() => {
    if (
      !headerScrollRef.current ||
      !bodyScrollRef.current ||
      !leftFixedRef.current
    )
      return;

    const bodyEl = bodyScrollRef.current;
    const headerEl = headerScrollRef.current;
    const leftFixedEl = leftFixedRef.current;

    const handleScroll = () => {
      headerEl.scrollLeft = bodyEl.scrollLeft;
      leftFixedEl.scrollTop = bodyEl.scrollTop;
    };

    bodyEl.addEventListener("scroll", handleScroll);
    return () => bodyEl.removeEventListener("scroll", handleScroll);
  }, []);

  async function fetchReport() {
    setLoading(true);

    let url = `/tickets/detailEmployeesReport?from=${fromDate}&to=${toDate}`;
    if (username.trim()) {
      url += `&username=${encodeURIComponent(username.trim())}`;
    }

    const res = await apiGet(url);
    setLoading(false);

    if (res.status !== 200) {
      handleApiError(res, popupMessage, router);
      return;
    }
    setData(res.data || []);
  }

  return (
    <section className="bg-white border border-blue-200 shadow-xl rounded-3xl p-6 mx-4 my-6 min-w-[60rem]">
      {/* Header + Filter */}
      <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
        <div className="flex items-center gap-3">
          {/* Search username */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tìm kiếm..."
            className="px-3 py-2 mr-4 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-gray-500">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg outline-none border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={fetchReport}
            className="px-5 py-2 font-semibold text-white transition bg-blue-700 shadow rounded-xl hover:bg-blue-900"
          >
            Lọc
          </button>
        </div>
      </div>

      <div className="flex flex-col max-w-full max-h-[calc(100vh-15rem)]">
        {/* header container */}
        <div
          ref={headerContainerRef}
          className="rounded-tl-xl rounded-tr-xl font-semibold text-left text-blue-900 bg-blue-100 flex pr-[0.5rem]"
        >
          {/* header fixed */}
          <div className="flex flex-none" data-header-fixed>
            <div className="px-4 py-3 whitespace-nowrap">#</div>
            <div className="px-4 py-3 whitespace-nowrap">Tài khoản</div>
            <div className="px-4 py-3 whitespace-nowrap">Tên nhân viên</div>
          </div>

          {/* header scroll */}
          <div ref={headerScrollRef} className="flex flex-1 overflow-hidden">
            <div className="flex flex-none" data-header-scroll>
              {allServices.map((srv) => (
                <div
                  key={srv.service_id}
                  className="px-4 py-3 flex-none font-semibold text-center whitespace-nowrap"
                >
                  {srv.service_name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* body container */}
        <div
          ref={bodyContainerRef}
          className="flex flex-row flex-1 overflow-hidden"
        >
          {/* body fixed */}
          <div
            ref={leftFixedRef}
            className="flex flex-col overflow-hidden pb-[0.7rem]"
          >
            {data.map((emp, idx) => (
              <div
                key={idx}
                className="flex border-b border-slate-300 hover:bg-blue-50"
              >
                <div className="flex" data-row-fixed={idx}>
                  <div className="px-4 py-3 font-semibold text-blue-800 whitespace-nowrap">
                    {idx + 1}
                  </div>
                  <div className="px-4 py-3 whitespace-nowrap">
                    {emp.username}
                  </div>
                  <div className="px-4 py-3 whitespace-nowrap">
                    {emp.full_name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* body scroll */}
          <div
            ref={bodyScrollRef}
            className="flex flex-col flex-1 overflow-x-auto overflow-y-auto employee-report-scroll pb-[0.2rem]"
          >
            <div className="flex flex-col">
              {data.map((emp, idx) => (
                <div
                  key={idx}
                  data-row-scroll={idx}
                  className="flex flex-row border-b border-slate-300 hover:bg-blue-50 w-max"
                >
                  {allServices.map((srv) => {
                    const found = emp.services_report?.find(
                      (s: any) => s.service_id === srv.service_id
                    );
                    return (
                      <div
                        key={srv.service_id}
                        className="px-4 py-3 text-center"
                      >
                        {found ? found.total_tickets : 0}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style jsx global>{`
        .employee-report-scroll::-webkit-scrollbar {
          height: 0.5rem; /* thanh ngang */
          width: 0.5rem; /* thanh ngang */
          background: #7c7c7c22;
        }

        .employee-report-scroll::-webkit-scrollbar-thumb {
          background: #7c7c7c44;
          border-radius: 1rem;
        }
      `}</style>
    </section>
  );
}
