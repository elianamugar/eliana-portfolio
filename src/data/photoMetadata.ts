export const titleOverrides: Record<string, string> = {
  boston_siff: "Boston SIFF",
  athens_greece: "Athens",
  crete_greece: "Crete",
  istanbul_turkey: "Istanbul",
  kusadasi_turkey: "Kusadasi",
  rhodes_greece: "Rhodes",
  san_francisco_iv: "San Francisco IV",
  santorini_greece: "Santorini",
  mykonos_greece: "Mykonos",
};

export const projectDates: Record<string, string> = {
  alaska: "2021-08",
  alcatraz: "2025-03",
  amsterdam: "2022-06",
  amsterdam_ii: "2024-06",
  apple_hill: "2022-03",
  athens_greece: "2025-10",
  barnstable: "2023-03",
  boston: "2020-03",
  boston_siff: "2023-04",
  brooklyn: "2020-03",
  brussels: "2022-06",
  california: "2023-07",
  carson_beach: "2023-05",
  copenhagen: "2022-06",
  crete_greece: "2025-10",
  death_valley: "2024-03",
  edinburgh: "2022-06",
  egypt: "2025-10",
  folsom_lake: "2021-06",
  glasgow: "2022-06",
  gualala: "2022-06",
  home: "2025-11",
  home_ii: "2026-01",
  istanbul_turkey: "2025-10",
  japan: "2023-01",
  joshua_tree: "2020-08",
  joshua_tree_ii: "2024-09",
  kusadasi_turkey: "2025-10",
  lake_berryessa: "2025-06",
  london: "2022-05",
  luxembourg: "2022-06",
  manresa: "2023-08",
  miami: "2022-07",
  monterey: "2021-05",
  montreal: "2023-03",
  mykonos_greece: "2025-10",
  naples: "2024-06",
  new_york: "2023-06",
  paris: "2022-06",
  philippines: "2022-12",
  pinnacle: "2024-03",
  rhodes_greece: "2025-10",
  salmon_falls: "2020-09",
  san_francisco: "2024-04",
  san_francisco_ii: "2025-01",
  san_francisco_iii: "2025-02",
  san_francisco_iv: "2022-07",
  santa_cruz: "2020-05",
  santa_monica: "2020-07",
  santorini_greece: "2025-10",
  south_lake_tahoe: "2023-08",
  switzerland: "2022-06",
  vienna: "2024-06",
};

export function formatProjectDate(dateString: string) {
  const [year, month] = dateString.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatPhotoTitle(project: string) {
  if (titleOverrides[project]) return titleOverrides[project];

  return project
    .split("_")
    .map((word: string) =>
      ["ii", "iii", "iv", "v"].includes(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}