"use client";

import { useParams } from "next/navigation";
import GetCsvPage from "../_components/get-csv";

export default function DynamicCsvPage() {
  const params = useParams();
  const id = params.id as string;

  return <GetCsvPage id={id} />;
}
