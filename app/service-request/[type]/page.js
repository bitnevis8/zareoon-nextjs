"use client";

import { use as usePromise } from "react";
import { notFound } from "next/navigation";
import ServiceRequestForm from "@/app/components/ServiceRequestForm";
import { isValidServiceType } from "@/app/data/serviceRequestForms";

export default function ServiceRequestPage({ params }) {
  const { type } = usePromise(params);
  if (!isValidServiceType(type)) notFound();
  return <ServiceRequestForm serviceType={type} />;
}
