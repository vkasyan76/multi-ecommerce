"use client";

import { AlertTriangleIcon } from "lucide-react";

const ErrorPage = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border border-black border-dashed flex items-center justify-center gap-y-4 p-8 flex-col bg-white w-full rounded-lg">
        <AlertTriangleIcon />
        <p className="text-base font-medium">Something went wrong</p>
      </div>
    </div>
  );
};

export default ErrorPage;
