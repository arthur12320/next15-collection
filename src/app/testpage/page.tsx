"use client";

import { SelectPlatform } from "@/db/schema/platforms";
import { useEffect, useState } from "react";
import { getPlatforms } from "../actions/platformActions";

export default function TestPage() {
  const [platforms, setPlatforms] = useState<SelectPlatform[]>([]);
  useEffect(() => {
    async function fetchPlatforms() {
      const fetchedPlatforms = await getPlatforms();
      setPlatforms(fetchedPlatforms);
    }
    // async function fetchUserCollections() {
    //   const fetchedColleciton = await getUserCollections();
    //   setCollections(fetchedColleciton);
    // }
    fetchPlatforms();
    // fetchUserCollections();
  }, []);
  return (
    <div className="">
      <div>testing the page</div>
      <div>{platforms?.map((platform) => platform.name)}</div>
    </div>
  );
}
