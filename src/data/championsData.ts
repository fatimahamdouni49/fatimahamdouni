export interface Champion {
    Name: string;
    Difficulty: string;
    HeroType: string;
  }
  
  const championsCSV = "/200125_LoL_champion_data.csv"; // Asegúrate de que el archivo esté en `public/`
  
  export const fetchChampions = async (): Promise<Champion[]> => {
    try {
      const response = await fetch(championsCSV);
      const text = await response.text();
      
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0]; // Primera fila = nombres de columnas
  
      return rows.slice(1).map((row) => ({
        Name: row[0]?.trim() || "",
        Difficulty: row[1]?.trim() || "",
        HeroType: row[2]?.trim() || "",
      }));
    } catch (error) {
      console.error("Error al cargar los datos del CSV:", error);
      return [];
    }
  };
  