import { Suspense } from "react";
import MessagesApp from "./MessagesApp";

export const metadata = {
  title: "پیام‌ها",
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">در حال بارگذاری…</div>}>
      <MessagesApp />
    </Suspense>
  );
}
