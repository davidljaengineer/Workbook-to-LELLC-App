
export const calculateWeightedC = (surfaces: { area: number; cValue: number }[]): number => {
  const totalArea = surfaces.reduce((sum, s) => sum + s.area, 0);
  if (totalArea === 0) return 0;
  const weightedSum = surfaces.reduce((sum, s) => sum + s.area * s.cValue, 0);
  return weightedSum / totalArea;
};

export const exportToCSV = (headers: string[], data: (string | number)[][], filename: string) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\r\n";

  data.forEach(rowArray => {
    const row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
